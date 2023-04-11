const db = require("../_helpers/db");
const constants = require("../_helpers/constants");
const mongoose = require("mongoose");

const User = db.User;
const Task = db.Task;
const TaskGiver = db.TaskGiver;

const _ = require("lodash");

module.exports = {
  acceptTask,
  fetchAvailableTasks,
};

//player gets list of available tasks according to profile
async function fetchAvailableTasks(socket, obj, cb, io) {
  console.log("Fetching all available task ");
  let user = await User.findById(obj.id);

  if (user) {
    const taskGiversUnlocked = user.task.unlockedTaskGivers;

    if (taskGiversUnlocked) {
      const allTasks = await fetchTasks(taskGiversUnlocked, user);

      cb({
        status: 200,
        data: allTasks,
      });
    }
  }
}


//player accepts task
async function acceptTask(socket, obj, cb, io) {
  console.log("Accepting new task ");
  let user = await User.findById(obj.id);
  const taskId = obj.taskId;
  if (user && taskId) {

  const taskInfo = await Task.findOne({ _id: taskId });
  
  if (taskInfo) {
    user.task.acceptedTask.taskId = taskId;
    user.task.acceptedTask.taskType = taskInfo.type;

    switch (taskInfo.type) {
      case "kill":
        console.log("Kill case");
        const progressKillType = {
          target: taskInfo.goal.target,
          reqCount: taskInfo.goal.count,
          weapon: taskInfo.goal.weapon,
          hitpoint: taskInfo.goal.hitpoint || "",
          currentCount: 0,
          progressPercentage: 0,
        };

        user.task.acceptedTask.progress = progressKillType;
        break;

      case "survival":
        const progressSurvivalType = {
          additionalCondition: taskInfo.goal.additionalCondition || {},
          reqExtractionCount: taskInfo.goal.extractionCount,
          currentExtractionCount: 0,
          progressPercentage: 0,
        };

        user.task.acceptedTask.progress = progressSurvivalType;
        break;
      case "waypoint-fetch":
        const progressWaypointFetchType = {
          additionalCondition: taskInfo.goal.additionalCondition || {},
          reqExtractionCount: taskInfo.goal.extractionCount,
          currentExtractionCount: 0,
          progressPercentage: 0,
        };

        user.task.acceptedTask.progress = progressWaypointFetchType;
        break;
      case "fetch":
        const progressFetchType = {
          additionalCondition: taskInfo.goal.additionalCondition || {},
          reqExtractionCount: taskInfo.goal.extractionCount,
          currentExtractionCount: 0,
          progressPercentage: 0,
        };

        user.task.acceptedTask.progress = progressFetchType;
        break;

      default:
        console.log("Wrong task type.");
        break;
    }
  }

  await user.save();

  }

  cb({
    status: 200,
    message: "task accepted successfully",
    data: user,
  });
}

const fetchTasks = async (taskGivers, user) => {
  const tasks = {};
  for (const giver of taskGivers) {
    const tg = giver.taskGiver;
    let task = await Task.find({ giver: tg });
    const completedTasks = user.task.completedTasks || [];
    let i = 0;
    for (let t of task) {
      if (completedTasks[i] == t._id) {
        t.isCompleted = true;
      }

      if (user.task.acceptedTask.taskId == t._id) {
        t.isAccepted = true;
      }
      i++;
    }

    _.remove(task, function (a) {
      return a.isCompleted === true;
    });

    _.slice(task, 0, 4);

    tasks[giver.taskGiver] = task;
  }
  return tasks;
};


