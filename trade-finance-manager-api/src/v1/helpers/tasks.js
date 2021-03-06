const CONSTANTS = require('../../constants');

const getFirstTask = (tasks) =>
  tasks[0].groupTasks[0];

const getTask = (taskId, tasks) =>
  tasks.find((t) => t.id === taskId);

const getGroup = (allTaskGroups, groupId) => {
  const group = allTaskGroups.find((g) => g.id === groupId);

  return group;
};

const isFirstTask = (taskId) => taskId === '1';

const isFirstTaskInAGroup = (taskId, groupId) =>
  (taskId === '1' && groupId > 1);

const isFirstTaskInFirstGroup = (taskId, groupId) =>
  (taskId === '1' && groupId === 1);

const previousTaskIsComplete = (allTaskGroups, group, taskId) => {
  if (isFirstTaskInFirstGroup(taskId, group.id)) {
    // no other tasks/groups before this task, so previous task is irrelevant
    return true;
  }

  if (isFirstTaskInAGroup(taskId, group.id)) {
    // check the last (previous) task in the previous group
    const previousGroupId = group.id - 1;
    const previousGroup = getGroup(allTaskGroups, previousGroupId);

    const totalTasksInPreviousGroup = previousGroup.groupTasks.length;
    const lastTaskInPreviousGroup = previousGroup.groupTasks[totalTasksInPreviousGroup - 1];

    if (lastTaskInPreviousGroup.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
      return true;
    }
  } else {
    // check the previous task in the current group
    const previousTaskId = String(Number(taskId - 1));

    const previousTask = getTask(previousTaskId, group.groupTasks);

    if (previousTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
      return true;
    }
  }

  return false;
};

const firstTaskIsComplete = (groupTasks) => {
  const firstTask = groupTasks.find((t) => t.id === '1');

  if (firstTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return true;
  }

  return false;
};

const canUpdateTask = (allTaskGroups, group, taskId) => {
  if (previousTaskIsComplete(allTaskGroups, group, taskId)) {
    return true;
  }

  return false;
};

module.exports = {
  getFirstTask,
  getTask,
  getGroup,
  isFirstTaskInAGroup,
  isFirstTaskInFirstGroup,
  previousTaskIsComplete,
  firstTaskIsComplete,
  isFirstTask,
  canUpdateTask,
};
