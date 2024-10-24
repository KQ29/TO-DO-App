from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    priority = db.Column(db.String(10), nullable=False)
    due_date = db.Column(db.String(20))
    completed = db.Column(db.Boolean, default=False)
