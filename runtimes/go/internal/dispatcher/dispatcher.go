package dispatcher

// Task represents a task to be executed
type Task struct {
	ID      string
	Type    string
	Prompt  string
	Inputs  map[string]string
	Status  string
}

// Dispatcher manages task dispatching
type Dispatcher struct {
	queue []Task
}

// NewDispatcher creates a new dispatcher
func NewDispatcher() *Dispatcher {
	return &Dispatcher{
		queue: make([]Task, 0),
	}
}

// AddTask adds a task to the queue
func (d *Dispatcher) AddTask(task Task) {
	d.queue = append(d.queue, task)
}

// NextTask returns the next task from the queue
func (d *Dispatcher) NextTask() *Task {
	if len(d.queue) == 0 {
		return nil
	}
	task := d.queue[0]
	d.queue = d.queue[1:]
	return &task
}

// QueueLength returns the number of tasks in the queue
func (d *Dispatcher) QueueLength() int {
	return len(d.queue)
}
