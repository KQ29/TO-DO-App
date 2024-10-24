from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db, Task  

# Initialize Flask application
app = Flask(__name__)

# Allow cross-domain requests for interaction with the frontend
CORS(app)

# Connect to the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///existing_todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the Flask application
db.init_app(app)

# Create tables when the application starts
with app.app_context():
    db.create_all()

# Route to get all tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    tasks_list = [{
        "id": task.id,
        "name": task.name,
        "priority": task.priority,
        "due_date": task.due_date,
        "completed": task.completed
    } for task in tasks]
    return jsonify(tasks_list)

# Route to add a new task
@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    new_task = Task(
        name=data['name'], 
        priority=data['priority'],
        due_date=data.get('due_date'),
        completed=data.get('completed', False)
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'message': 'Task added successfully'}), 201

# Route to update a task
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if task:
        data = request.get_json()  # Get the new task data
        task.name = data.get('name', task.name)
        task.priority = data.get('priority', task.priority)
        task.due_date = data.get('due_date', task.due_date)
        task.completed = data.get('completed', task.completed)

        db.session.commit()  # Commit the changes to the database
        return jsonify({"message": "Task updated successfully!"}), 200
    return jsonify({"message": "Task not found"}), 404

# Route to delete a task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully!"}), 200
    return jsonify({"message": "Task not found"}), 404

# Run the Flask server
if __name__ == '__main__':
    app.run(debug=True)
