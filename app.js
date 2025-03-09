const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'task.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(DB Error: ${error.message})
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    id: dbObject.id,
    title: dbObject.title,
    description: dbObject.description,
  }
}

app.get('/tasks/', async (request, response) => {
  const getTasksQuery = `
    SELECT
      *
    FROM
      tasks;`
  const tasksArray = await database.all(getTasksQuery)
  response.send(
    tasksArray.map(eachTask => convertDbObjectToResponseObject(eachTask)),
  )
})

app.get('/tasks/:taskId/', async (request, response) => {
  const {taskId} = request.params
  const getTaskQuery = `
    SELECT 
      * 
    FROM 
      tasks 
    WHERE 
      id = ${taskId};`
  const task = await database.get(getTaskQuery)
  response.send(convertDbObjectToResponseObject(task))
})

app.post('/tasks/', async (request, response) => {
  const {id, title, description} = request.body
  const postTaskQuery = `
  INSERT INTO
    tasks (id, title, description)
  VALUES
    ('${id}', ${title}, '${description}');`
  const task = await database.run(postTaskQuery)
  response.send('Task Added Successfully')
})

app.put('/tasks/:taskId/', async (request, response) => {
  const {id, title, description} = request.body
  const {taskId} = request.params
  const updateTaskQuery = `
  UPDATE
    tasks
  SET
    id = '${id}',
    title = ${title},
    description = '${description}'
  WHERE
    id = ${id};`

  await database.run(updateTaskQuery)
  response.send('Task Details Updated')
})

app.delete('/tasks/:taskId/', async (request, response) => {
  const {taskId} = request.params
  const deleteTaskQuery = `
  DELETE FROM
    tasks
  WHERE
    id = ${taskId};`
  await database.run(deleteTaskQuery)
  response.send('task Removed')
})
module.exports = app
