# Drag & Drop en Kanban Board

**Stack involucrado:** Angular 21.2 + Angular CDK 21.x + NestJS 11 + TypeORM + PostgreSQL

---

## Índice

1. [Instalación](#1-instalación)
2. [Backend — Estado actual](#2-backend--estado-actual)
3. [Frontend — Implementación paso a paso](#3-frontend--implementación-paso-a-paso)
   - [3.1. Importar módulo DragDrop](#31-importar-módulo-dragdrop)
   - [3.2. Hacer tareas arrastrables](#32-hacer-tareas-arrastrables)
   - [3.3. Crear zonas de drop en columnas](#33-crear-zonas-de-drop-en-columnas)
   - [3.4. Conectar drop lists entre columnas](#34-conectar-drop-lists-entre-columnas)
   - [3.5. Manejar evento de drop (tareas)](#35-manejar-evento-de-drop-tareas)
   - [3.6. Reordenar columnas](#36-reordenar-columnas)
4. [Lógica de reordenamiento](#4-lógica-de-reordenamiento)
   - [4.1. Recalcular posiciones](#41-recalcular-posiciones)
   - [4.2. Mover tarea entre columnas](#42-mover-tarea-entre-columnas)
   - [4.3. Reordenar dentro de la misma columna](#43-reordenar-dentro-de-la-misma-columna)
5. [Optimistic Updates](#5-optimistic-updates)
6. [Servicios y API](#6-servicios-y-api)
   - [6.1. TaskListService — updatePosition](#61-tasklistservice--updateposition)
   - [6.2. Llamadas desde el board](#62-llamadas-desde-el-board)
7. [Consideraciones importantes](#7-consideraciones-importantes)
   - [7.1. Conflicto con menús contextuales](#71-conflicto-con-menús-contextuales)
   - [7.2. Rendimiento y refreshWorkspace](#72-rendimiento-y-refreshworkspace)
   - [7.3. Persistencia del orden](#73-persistencia-del-orden)
   - [7.4. Drag handle vs drag libre](#74-drag-handle-vs-drag-libre)
   - [7.5. Touch devices](#75-touch-devices)
   - [7.6. Estado de carga durante la operación](#76-estado-de-carga-durante-la-operación)
8. [Resumen de cambios necesarios](#8-resumen-de-cambios-necesarios)

---

## 1. Instalación

Agregar Angular CDK al proyecto:

```bash
cd user-web-portal
npm install @angular/cdk
```

El paquete `@angular/cdk` incluye el módulo `DragDropModule` que se usará para toda la funcionalidad. No requiere configuración adicional ni polyfills.

---

## 2. Backend — Estado actual

### 2.1. Tareas (`PATCH /task/:id`)

El backend **ya soporta** mover y reordenar tareas. El `UpdateTaskDto` acepta:

```typescript
// backend/src/task/dto/update-task.dto.ts
export class UpdateTaskDto {
  position?: number;    // Nueva posición dentro de la columna
  taskListId?: number;  // ID de la columna destino (para mover entre columnas)
  title?: string;
  description?: string;
  completed?: boolean;
  dateInit?: string;
  dateEnd?: string;
}
```

Y el `update()` del servicio aplica el cambio de `taskListId` y `position` correctamente:

```typescript
// backend/src/task/task.service.ts
async update(id: number, updateTaskDto: UpdateTaskDto) {
  if (updateTaskDto.taskListId !== undefined) {
    entity.taskList = { id: updateTaskDto.taskListId } as TaskList;
  }
  const { taskListId, ...rest } = updateTaskDto;
  this.taskRepository.merge(entity, rest);
  await this.taskRepository.save(entity);
}
```

**✅ No requiere cambios.**

### 2.2. Columnas / Task Lists (`PATCH /task-list/:id`)

`UpdateTaskListDto` extiende `PartialType(CreateTaskListDto)`:

```typescript
// backend/src/task-list/dto/create-task-list.dto.ts
export class CreateTaskListDto {
  title: string;
  boardId: number;
  position: number;
}

// backend/src/task-list/dto/update-task-list.dto.ts
export class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}
```

Esto significa que `PATCH /task-list/:id` ya acepta opcionalmente `{ position: number }`.

**⚠️ Verificar la implementación concreta de `UpdateTaskListUseCase`** para asegurarse de que no ignora `position`. Si el use case solo actualiza `title`, habrá que modificarlo.

### 2.3. Task List Controller — AuthGuard

El archivo `revision-backend.md` indica que `TaskListController` **no tiene** `@UseGuards(AuthGuard())`. Si el drag-and-drop va a producción, debe agregarse:

```typescript
// backend/src/task-list/task-list.controller.ts
@Controller('task-list')
@UseGuards(AuthGuard('jwt'))  // <-- Agregar
export class TaskListController { ... }
```

---

## 3. Frontend — Implementación paso a paso

### 3.1. Importar módulo DragDrop

Agregar `DragDropModule` en el componente `Board` (o en un módulo compartido si no se usan standalone):

```typescript
// user-web-portal/src/app/workspace/pages/workspace-detail/pages/board/board.ts
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  imports: [TaskList, ModalComponent, TaskForm, TaskDetail, DragDropModule],
  ...
})
export class Board { ... }
```

### 3.2. Hacer tareas arrastrables

En el template `task.html`, envolver el contenedor de la tarea con `cdkDrag`:

```html
<!-- task.html -->
<div cdkDrag class="group relative bg-white rounded-xl ...">
  <!-- contenido existente -->
</div>
```

Si se desea un **drag handle** (para no interferir con clicks), agregar `cdkDragHandle` a un elemento específico:

```html
<div cdkDragHandle class="cursor-grab active:cursor-grabbing">
  <!-- ícono o área de agarre -->
</div>
```

Sin drag handle, la tarea entera es arrastrable. Esto puede interferir con el menú de tres puntos — ver [sección 7.1](#71-conflicto-con-menús-contextuales).

### 3.3. Crear zonas de drop en columnas

En `task-list.html`, el contenedor de tareas se convierte en `cdkDropList`:

```html
<!-- task-list.html -->
<div
  cdkDropList
  [cdkDropListData]="list().tasks"
  (cdkDropListDropped)="onTaskDropped($event)"
  class="flex-1 px-3 py-3 overflow-y-auto space-y-3 min-h-0"
>
  @for (task of list().tasks; track task.id) {
    <workspace-task cdkDrag [cdkDragData]="task" [task]="task"></workspace-task>
  }
</div>
```

```typescript
// task-list.ts
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

onTaskDropped(event: CdkDragDrop<Task[]>) {
  if (event.previousContainer === event.container) {
    // Misma columna — reordenar
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // Recalcular posiciones y persistir
    this.reorderTasks(event.container.data);
  } else {
    // Columna diferente — mover tarea
    const task = event.previousContainer.data[event.previousIndex];
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    // Persistir movimiento
    this.moveTask(task, event.container.data, event.currentIndex);
  }
}
```

### 3.4. Conectar drop lists entre columnas

Cada columna necesita una `id` única para que `cdkDropListConnectedTo` funcione. En `board.html`:

```html
<!-- board.html -->
@for (list of workspace()!.boards[0]!.lists; track list.id) {
  <workspace-task-list
    [list]="list"
    [connectedLists]="listIds()"
    (createTask)="openTaskFormModal()"
    (deleteList)="onDeleteList($event)"
  />
}
```

```typescript
// board.ts
protected listIds = computed(() => {
  const ws = this.workspace();
  return ws?.boards[0]?.lists.map(l => `task-list-${l.id}`) ?? [];
});
```

Y en `task-list.html`:

```html
<div
  cdkDropList
  [id]="'task-list-' + list().id"
  [cdkDropListData]="list().tasks"
  [cdkDropListConnectedTo]="connectedLists()"
  (cdkDropListDropped)="onTaskDropped($event)"
  ...
>
```

```typescript
// task-list.ts
connectedLists = input<string[]>([]);
```

### 3.5. Manejar evento de drop (tareas)

Implementación completa del handler en `task-list.ts`:

```typescript
import { output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// Evento hacia el board para persistir
taskMoved = output<{ task: Task; newListId: number; position: number }>();
taskReordered = output<{ listId: number; taskId: number; position: number }>();

onTaskDropped(event: CdkDragDrop<Task[]>) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    const task = event.container.data[event.currentIndex];
    this.taskReordered.emit({
      listId: this.list().id,
      taskId: task.id,
      position: event.currentIndex,
    });
  } else {
    const task = event.previousContainer.data[event.previousIndex];
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    this.taskMoved.emit({
      task,
      newListId: this.list().id,
      position: event.currentIndex,
    });
  }
}
```

**Importante**: No llamar `refreshWorkspace()` inmediatamente después del drop porque la animación de CDK se vería interrumpida. Programar la llamada después de un breve delay o permitir que el drag complete su animación.

### 3.6. Reordenar columnas

En `board.html`, convertir el contenedor principal en un `cdkDropList` horizontal:

```html
<!-- board.html -->
<div
  cdkDropList
  orientation="horizontal"
  [cdkDropListData]="workspace()!.boards[0]!.lists"
  (cdkDropListDropped)="onListDropped($event)"
  class="flex gap-5 h-full p-6 min-w-max"
>
  @for (list of workspace()!.boards[0]!.lists; track list.id) {
    <workspace-task-list cdkDrag [list]="list" ... />
  }
</div>
```

```typescript
// board.ts
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

onListDropped(event: CdkDragDrop<BoardList[]>) {
  moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  // Persistir nuevo orden
  const list = event.container.data[event.currentIndex];
  this.taskListService.updatePosition(list.id, event.currentIndex).subscribe();
}
```

---

## 4. Lógica de reordenamiento

### 4.1. Recalcular posiciones

Después de un drop, las posiciones de todas las tareas en la columna deben ser consistentes. La estrategia recomendada:

```typescript
reorderTasks(tasks: Task[], listId: number): void {
  tasks.forEach((task, index) => {
    if (task.position !== index) {
      this.taskService.updateTask(task.id, {
        position: index,
        taskListId: listId,
      }).subscribe();
    }
  });
}
```

**Alternativa más eficiente**: en vez de N llamadas, crear un endpoint batch `PATCH /task/reorder` que acepte un array de `{ id, position, taskListId }`. Esto es ideal si hay muchas tareas.

### 4.2. Mover tarea entre columnas

Cuando una tarea se mueve a otra columna:

```typescript
moveTask(task: Task, targetListId: number, position: number): void {
  this.taskService.updateTask(task.id, {
    position,
    taskListId: targetListId,
  }).subscribe();
}
```

### 4.3. Reordenar dentro de la misma columna

```typescript
onTaskReordered(data: { listId: number; taskId: number; position: number }): void {
  this.taskService.updateTask(data.taskId, {
    position: data.position,
  }).subscribe();
}
```

---

## 5. Optimistic Updates

Actualmente, cada mutación llama a `refreshWorkspace()` que hace un GET completo del workspace. Para una experiencia fluida:

### 5.1. Estado actual (sin optimistic update)

1. Usuario suelta tarea
2. Se modifica el array local (inmediato, visual)
3. Se llama a `PATCH /task/:id`
4. `refreshWorkspace()` recarga todo
5. La UI se actualiza de nuevo (puede causar flicker si la red es lenta)

### 5.2. Con optimistic update (recomendado)

1. Usuario suelta tarea
2. Se modifica el array local (inmediato, visual)
3. Se llama a `PATCH /task/:id`
4. **NO** se llama `refreshWorkspace()` — confiamos en el cambio local
5. Si el PATCH falla, se revierte el array local al estado anterior

```typescript
moveTask(task: Task, targetList: BoardList, position: number): void {
  const previousListId = /* guardar referencia */;

  // Snapshot del estado anterior
  const snapshot = {
    tasks: [...targetList.tasks],
    sourceTasks: [.../* columna origen */],
  };

  this.taskService.updateTask(task.id, {
    position,
    taskListId: targetList.id,
  }).subscribe({
    error: () => {
      // Revertir cambios locales
      targetList.tasks = snapshot.tasks;
      // restaurar columna origen
      this.notificationService.error('Error al mover tarea');
    },
    // No hacer nada en next — el estado local ya es correcto
  });
}
```

---

## 6. Servicios y API

### 6.1. TaskListService — updatePosition

Agregar método para actualizar posición de columna:

```typescript
// user-web-portal/src/app/workspace/services/task-list-service.ts
updatePosition(id: number, position: number) {
  return this.http.patch<TaskListResponse>(`${this.baseUrl}/${id}`, { position }).pipe(
    map((response) => WorkspaceMapper.toTaskList(response)),
    tap(() => {
      this.workspaceState.refreshWorkspace();
    }),
    catchError((error) => {
      this.handleError(error);
      return of(null);
    }),
  );
}
```

### 6.2. Llamadas desde el board

El servicio `TaskService.updateTask()` **ya soporta** el envío de `position` y `taskListId` — no requiere cambios.

---

## 7. Consideraciones importantes

### 7.1. Conflicto con menús contextuales

El menú de tres puntos en cada tarea (`toggleMenu()`) usa `event.stopPropagation()`. CDK Drag no interfiere con clicks, pero el drag puede activarse accidentalmente al intentar abrir el menú.

**Solución recomendada**: Usar `cdkDragHandle` en un área específica de la tarea (el borde izquierdo o un icono de agarre) en vez de hacer toda la tarea arrastrable. Esto es más predecible para el usuario.

```html
<div cdkDrag>
  <div cdkDragHandle class="absolute left-0 top-0 bottom-0 w-1 cursor-grab active:cursor-grabbing hover:bg-blue-200/30 rounded-l-xl transition-colors"></div>
  <!-- resto del contenido -->
</div>
```

### 7.2. Rendimiento y refreshWorkspace

`refreshWorkspace()` hace una petición GET completa y reemplaza todo el estado. Para drag-and-drop esto es problemático:

- **Alta latencia**: el usuario ve flicker al re-renderizar todo
- **Pérdida de estado**: animaciones en progreso se interrumpen
- **Inconsistencias**: si múltiples drops ocurren rápido, las respuestas pueden llegar en desorden

**Recomendación**: Modificar `refreshWorkspace()` para que sea más granular, o usar [optimistic updates](#5-optimistic-updates) y solo recargar cuando el usuario cambie de página o haga una acción no-drag.

Para un enfoque intermedio, usar `refreshWorkspace()` **solo** en el callback `complete` del PATCH, y retrasarlo 300ms para que las animaciones de CDK terminen:

```typescript
setTimeout(() => this.workspaceState.refreshWorkspace(), 300);
```

### 7.3. Persistencia del orden

El campo `position` en `TaskList` y `Task` determina el orden. Consideraciones:

- Las posiciones deben ser enteros consecutivos (0, 1, 2...) o pueden ser gaps (1000, 2000, 3000...) para evitar reordenar todo en cada drop.
- Si usas gaps, cuando se acaben los espacios disponibles, hay que reindexar.
- El enfoque más simple es recalcular posiciones consecutivas después de cada drop (como se muestra en [4.1](#41-recalcular-posiciones)).

### 7.4. Drag handle vs drag libre

| Enfoque | Pros | Contras |
|---------|------|---------|
| **Drag libre** (toda la tarea) | Menos código, más directo | Conflictos con clicks, menús y selección de texto |
| **Drag handle** (área específica) | UX predecible, sin conflictos | Requires indicador visual, más código |

**Recomendado**: Usar drag handle para tareas, drag libre para columnas (que no tienen menús conflictivos).

### 7.5. Touch devices

`@angular/cdk/drag-drop` **soporta táctil por defecto**. No requiere configuración adicional. Sin embargo, considerar:

- En mobile, el drag handle debe tener al menos 44x44px de área táctil
- Las animaciones deben ser rápidas (150-200ms) para sentirse responsivas
- Probar que el scroll vertical no interfiera con el drag horizontal de columnas

### 7.6. Estado de carga durante la operación

Para evitar que el usuario mueva la misma tarea mientras se persiste el cambio anterior:

```typescript
// task-list.ts
protected dragging = signal(false);

onDragStarted(): void {
  this.dragging.set(true);
}

onTaskDropped(event: CdkDragDrop<Task[]>): void {
  this.dragging.set(false);
  // ... resto de la lógica
}
```

Y deshabilitar el botón "Add task" mientras `dragging()` es `true`.

---

## 8. Resumen de cambios necesarios

| Archivo | Cambio |
|---------|--------|
| **Instalación** | `npm install @angular/cdk` |
| **`board.ts`** | Importar `DragDropModule`, agregar `onListDropped()`, `listIds()` computed |
| **`board.html`** | Envolver flex container con `cdkDropList` horizontal, pasar `connectedLists` |
| **`task-list.ts`** | Importar `CdkDragDrop`, implementar `onTaskDropped()`, emitir eventos al board |
| **`task-list.html`** | Agregar `cdkDropList` al contenedor de tareas, `cdkDrag` a `workspace-task` |
| **`task.ts`** | Opcional: agregar `cdkDrag` y `cdkDragHandle` |
| **`task.html`** | Opcional: agregar drag handle |
| **`task-list-service.ts`** | Agregar método `updatePosition(id, position)` |
| **`task-list.controller.ts`** (backend) | Agregar `@UseGuards(AuthGuard('jwt'))` si falta |

### Archivos que NO requieren cambios

- `backend/src/task/dto/update-task.dto.ts` — ya soporta `position` y `taskListId`
- `backend/src/task/task.service.ts` — ya maneja `taskListId` y `position`
- `backend/src/task-list/dto/update-task-list.dto.ts` — ya soporta `position`
- `user-web-portal/src/app/workspace/services/task-service.ts` — `updateTask()` ya acepta `position` y `taskListId`
- `user-web-portal/src/app/workspace/models/workspace.models.ts` — `UpdateTaskDto` y `BoardList` ya tienen `position`
