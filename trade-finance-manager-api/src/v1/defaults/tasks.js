const CONSTANTS = require('../../constants');

const taskDefaults = () => ({
  status: CONSTANTS.TASKS.STATUS.CANNOT_START,
  assignedTo: {
    userId: CONSTANTS.TASKS.UNASSIGNED,
    userFullName: CONSTANTS.TASKS.UNASSIGNED,
  },
  canEdit: false,
});

const createGroupTasks = (tasks, groupId) =>
  tasks.map((t, index) => {
    let task = t;

    const taskId = index + 1;

    task = {
      id: String(taskId),
      groupId,
      ...task,
      ...taskDefaults(groupId, taskId),
    };

    // task can only be edited by default,
    // if it's the first task in the first group.
    if (groupId === 1 && index === 0) {
      task.canEdit = true;
      task.status = CONSTANTS.TASKS.STATUS.TO_DO;
    }

    return task;
  });

const TASKS = {
  AIN: [
    {
      groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
      id: 1,
      groupTasks: createGroupTasks(CONSTANTS.TASKS.AIN.GROUP_1.TASKS, 1),
    },
  ],
  MIA: [
    {
      groupTitle: CONSTANTS.TASKS.MIA.GROUP_1.GROUP_TITLE,
      id: 1,
      groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_1.TASKS, 1),
    },
    {
      groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
      id: 2,
      groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_2.TASKS, 2),
    },
    {
      groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
      id: 3,
      groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_3.TASKS, 3),
    },
    {
      groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
      id: 4,
      groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_4.TASKS, 4),
    },
  ],
};

module.exports = {
  taskDefaults,
  createGroupTasks,
  TASKS,
};
