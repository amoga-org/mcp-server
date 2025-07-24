import { v4 as uuidv4 } from "uuid";
let cmmnshapedata = "";
let edgesData = "";

function indexBy(list, fn = (obj) => obj) {
  try {
    return list.reduce(
      (prev, next) => ({
        ...prev,
        [fn(next)]: next,
      }),
      {}
    );
  } catch (error) {
    console.error(error);
    return {};
  }
}
const coordrinateKeys = {
  tl_x: null,
  tl_y: null,
  tr_x: null,
  tr_y: null,
  bl_x: null,
  bl_y: null,
  br_x: null,
  br_y: null,
  xp: null,
  yp: null,
  x: null,
  y: null,
  w: null,
  h: null,
};
export const genarateXML = (applicationDetail, caseName, stages) => {
  try {
    const stagesLength = stages.length;
    let totalTasks = 0;
    let topTasks = 0;
    let bottomTasks = 0;
    let topHeight = 0;
    let bottomHeight = 0;
    let taskmargins = 0;
    let containerHeight = 0;
    let containerWidth = 0;
    let margin = 50;
    let taskHeight = 80;
    let taskWidth = 120;
    let marginLeft = 80;
    let marginTop = 80;
    let stagedata = stages.map((task, index) => {
      const tasksLength = task.tasks.length || 0;
      totalTasks = totalTasks + tasksLength;
      taskmargins = taskmargins + tasksLength + 1;
      let height;
      let width;
      if (task.type == "stage") {
        height = tasksLength * taskHeight + (tasksLength + 1) * margin;
        width = tasksLength * taskWidth + (tasksLength + 1) * margin;
      } else {
        taskmargins = totalTasks + 1;
        totalTasks = taskmargins + 1;
        height = 80;
        width = 120;
      }

      if (index % 2 == 0) {
        topTasks = topTasks + tasksLength;
        topHeight = topHeight + height + margin;
      } else {
        bottomTasks = bottomTasks + tasksLength;
        bottomHeight = bottomHeight + height + margin;
      }
      return {
        ...task,
        // isBlockedOn: {
        //     events: task?.isBlockedOn?.events?.filter((task) => task.taskname && task.on) || [],
        //     conditions: task?.isBlockedOn?.conditions?.filter((task) => task.taskname && task.condition) || [],
        // },
        tasks: filterTaskdata(task.tasks),
        h: height,
        w: width,
      };
    });

    //clear empty startsWhen of tasks
    function filterTaskdata(tasks) {
      return tasks.map((task, index) => {
        return {
          ...task,
          // isBlockedOn: {
          //     events: task?.isBlockedOn?.events?.filter((task) => task?.taskname && task?.on) || [],
          //     conditions:
          //         task?.isBlockedOn?.conditions?.filter((task) => task?.taskname && task?.condition) || [],
          // },
          isDefault: index == 0 ? true : false,
        };
      });
    }

    let data = stagedata;
    data = JSON.parse(JSON.stringify(stagedata));
    //container height is calculated by considering all tasks
    containerHeight =
      totalTasks * taskHeight + (stagesLength + 1 + taskmargins) * margin;
    containerWidth =
      totalTasks * taskWidth + (stagesLength + 1 + taskmargins) * margin;

    //divide the stages into top and bottom
    let topStages = [];
    let bottomStages = [];
    data.map((task, index) => {
      if (index % 2 == 0) {
        topStages.push(task);
      } else {
        bottomStages.push(task);
      }
    });
    //reverse the top array, it will be easy to calculate y from to to bottom
    topStages = topStages.reverse();
    let t_h = 30;

    for (let index = 0; index < topStages.length; index++) {
      topStages[index].y = t_h + margin;
      t_h = t_h + topStages[index].h + margin;
    }
    //go down into bottomstages and calculate height
    for (let index = 0; index < bottomStages.length; index++) {
      bottomStages[index].y = t_h + margin;
      t_h = t_h + bottomStages[index].h + margin;
    }
    //reverse the topstages and merge both stages
    topStages = topStages.reverse();
    let mergedData = [];
    for (let index = 0; index < data.length; index++) {
      if (index % 2 === 0) {
        mergedData.push(topStages.shift());
      } else {
        mergedData.push(bottomStages.shift());
      }
    }

    //once sorted calculate the x of stages
    let l_w = 50;
    for (let index = 0; index < mergedData.length; index++) {
      mergedData[index].x = l_w + margin;
      l_w = l_w + mergedData[index].w + margin;
    }

    data = mergedData;

    const getTaskPositions = (stage) => {
      let tasks = stage.tasks;
      const tasksLength = tasks.length;
      let midHeight = Math.floor(tasksLength / 2);
      let s_xaxis = 1;
      let s_topy = midHeight + 1;
      let s_bottomy = midHeight + 1;

      let topTasks_ = [];
      let bottomtasks_ = [];

      for (let i = 1; i <= tasksLength; i++) {
        if (i % 2 == 0) {
          s_topy = s_topy - 1;
          tasks[i - 1].xp = s_xaxis;
          tasks[i - 1].yp = s_topy;
          s_xaxis = s_xaxis + 1;
        } else {
          tasks[i - 1].xp = s_xaxis;
          tasks[i - 1].yp = s_bottomy;
          s_xaxis = s_xaxis + 1;
          s_bottomy = s_bottomy + 1;
        }
      }

      tasks = tasks.map((task, index) => {
        return {
          ...task,
          x: stage.x + (index + 1) * margin + (task.xp - 1) * taskWidth,
          h: taskHeight,
          w: taskWidth,
        };
      });

      for (let i = 0; i < tasksLength; i++) {
        if (i % 2 === 0) {
          topTasks_.push(tasks[i]);
        } else {
          bottomtasks_.push(tasks[i]);
        }
      }

      topTasks_ = topTasks_.reverse();

      for (let index = 0; index < topTasks_.length; index++) {
        topTasks_[index].y =
          stage.y + index * taskHeight + (index + 1) * margin;
      }

      for (let index = 0; index < bottomtasks_.length; index++) {
        bottomtasks_[index].y =
          stage.y +
          topTasks_.length * taskHeight +
          topTasks_.length * margin +
          +index * taskHeight +
          (index + 1) * margin;
      }

      topTasks_ = topTasks_.reverse();

      let mergedtasks = [];

      for (let index = 0; index < tasks.length; index++) {
        if (index % 2 === 0) {
          mergedtasks.push(topTasks_.shift());
        } else {
          mergedtasks.push(bottomtasks_.shift());
        }
      }

      return mergedtasks;
    };
    // adding topLeft (x,y), topRight (x,y), bottomLeft (x,y) to bottomRight(x,y) stage
    data = data.map((task) => {
      let currX = task.x;
      let currY = task.y;
      let width = task.w;
      let height = task.h;
      return {
        ...task,
        tl_x: currX,
        tl_y: currY,
        tr_x: currX + width,
        tr_y: currY,
        bl_x: currX,
        bl_y: currY + height,
        br_x: currX + width,
        br_y: currY + height,
        tasks: getTaskPositions(task),
      };
    });
    // adding topLeft (x,y), topRight (x,y), bottomLeft (x,y) to bottomRight(x,y) tasks
    data = data.map((task) => {
      return {
        ...task,
        tasks: task.tasks.map((item) => {
          let currX = item.x;
          let currY = item.y;
          let width = item.w;
          let height = item.h;
          return {
            ...item,
            tl_x: currX,
            tl_y: currY,
            tr_x: currX + width,
            tr_y: currY,
            bl_x: currX,
            bl_y: currY + height,
            br_x: currX + width,
            br_y: currY + height,
          };
        }),
      };
    });

    //*********************************calculating edge**********************************************************/

    data = calculationEdges(data, applicationDetail, caseName);
    data = data.map((elm, index) => {
      return {
        ...elm,
        tasks: calculationEdges(elm.tasks, applicationDetail, caseName),
      };
    });

    //********************************************************************************************************** */
    let xmlData = "";
    xmlData =
      xmlData +
      getDefinationStart(applicationDetail, caseName) +
      getCaseStart(applicationDetail, caseName) +
      getCasePlanItemStart(applicationDetail, caseName) +
      getStageStart(applicationDetail, caseName, data) +
      getTaskData(applicationDetail, caseName, data) +
      getCasePlanItemEnd(applicationDetail, caseName) +
      getCaseEnd(applicationDetail, caseName) +
      getCMMNDIStart(
        applicationDetail,
        caseName,
        containerHeight,
        containerWidth
      ) +
      cmmnshapedata +
      edgesData +
      getCMMNDIEnd(applicationDetail, caseName) +
      getDefinationsEnd(applicationDetail, caseName);
    return xmlData;
  } catch (error) {
    console.error(error);
  }
  //clear empty startsWhen of stages,
};
const getDefinationStart = (applicationDetail, caseName) => {
  const definitionsStart = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:flowable="http://flowable.org/cmmn" xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI" xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC" xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI" targetNamespace="http://www.flowable.org/casedef" exporter="Flowable Open Source Modeler">
`;
  return definitionsStart;
};

const getDefinationsEnd = (applicationDetail, caseName) => {
  const definitionsend = `</definitions>`;
  return definitionsend;
};

const getCaseStart = (applicationDetail, caseName) => {
  const caseStart = `<case id="${caseName}_${applicationDetail.identifier}" name="${caseName}_${applicationDetail.identifier}" flowable:initiatorVariableName="initiator">`;
  return caseStart;
};

const getCaseEnd = (applicationDetail, caseName) => {
  const caseEnd = `</case>`;
  return caseEnd;
};

const getCasePlanItemStart = (applicationDetail, caseName) => {
  const casePlanItemStart = `<casePlanModel id="${caseName}123" flowable:formKey="" flowable:formFieldValidation="true">
    <planItem id="planItem${applicationDetail.slug + caseName}" name="${
    applicationDetail.slug + caseName
  }" definitionRef="${caseName}_${
    applicationDetail.identifier
  }stage"></planItem>
    <stage id="${caseName}_${
    applicationDetail.identifier
  }stage" name="${caseName}_${applicationDetail.identifier}">
    <extensionElements>
    <flowable:planItemLifecycleListener sourceState="available" targetState="active" class="org.flowable.ui.application.lifecycle.listener.TemporalListener"></flowable:planItemLifecycleListener>
  </extensionElements>
    `;
  return casePlanItemStart;
};

const getCasePlanItemEnd = (applicationDetail, caseName) => {
  const casePlanItemEnd = `</stage></casePlanModel>`;
  return casePlanItemEnd;
};

const getCMMNDIStart = (
  applicationDetail,
  caseName,
  containerHeight,
  containerWidth
) => {
  const CMMNDIStart = ` <cmmndi:CMMNDI>
    <cmmndi:CMMNDiagram id="CMMNDiagram_${caseName}_${
    applicationDetail.identifier
  }">
    <cmmndi:CMMNShape id="CMMNShape_${caseName}" cmmnElementRef="${caseName}123">
    <dc:Bounds height="${containerHeight + 50}" width="${
    containerWidth + 50
  }" x="20" y="30"></dc:Bounds>
    <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
    </cmmndi:CMMNShape>
    <cmmndi:CMMNShape id="CMMNShape_${
      applicationDetail.slug + caseName
    }" cmmnElementRef="planItem${applicationDetail.slug + caseName}">
    <dc:Bounds height="${containerHeight}" width="${containerWidth}" x="40" y="50"></dc:Bounds>
    <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
  </cmmndi:CMMNShape>
    `;

  return CMMNDIStart;
};

const getCMMNDIEnd = (applicationDetail, caseName) => {
  const CMMNDIEnd = `</cmmndi:CMMNDiagram>
    </cmmndi:CMMNDI>`;

  return CMMNDIEnd;
};

const getStageStart = (applicationDetail, caseName, stageDataValue) => {
  let stagedata = "";
  let sentryData = "";
  let initiator = "${initiator}";
  stageDataValue.map((stage) => {
    let condition =
      "$" + `{repetitionCounter < ${stage.repetitionCounter || 10}}`;
    const sentries = stage.sentry;
    let entryCriterionData = "";
    sentries.map((item, index) => {
      let planItemOnPartData = "";
      item.edges.map((edgeel) => {
        let waypointdata = "";
        planItemOnPartData =
          planItemOnPartData +
          `<planItemOnPart id="sentryOnPart${
            stage.slug + edgeel.source + index
          }" sourceRef="planItem${edgeel.source}">
                            <standardEvent>${edgeel.operator}</standardEvent>
                        </planItemOnPart>`;

        edgeel.waypoints.map(
          (wp) =>
            (waypointdata =
              waypointdata +
              `<di:waypoint  x="${wp.x}" y="${wp.y}"></di:waypoint>`)
        );
        edgesData =
          edgesData +
          `<cmmndi:CMMNEdge id="CMMNEdge_sid-${edgeel.source}_to_${
            edgeel.target
          }${index}" cmmnElementRef="planItem${
            edgeel.source
          }" targetCMMNElementRef="sid-${edgeel.target + index}">
                            <di:extension>
                                <flowable:docker type="source" x="${
                                  edgeel.sx
                                }" y="${edgeel.sy}"></flowable:docker>
                                <flowable:docker type="target" x="${
                                  edgeel.tx
                                }" y="${edgeel.ty}"></flowable:docker>
                            </di:extension>
                           ${waypointdata}
                            <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
                        </cmmndi:CMMNEdge>`;
      });
      entryCriterionData =
        entryCriterionData +
        `<entryCriterion id="sid-${stage.slug + index}" sentryRef="sentry${
          stage.slug + index
        }"></entryCriterion>`;
      sentryData =
        sentryData +
        `<sentry id="sentry${stage.slug + index}">
                    ${planItemOnPartData}
                <ifPart>
                    <condition>
                    <![CDATA[${item.condition || ""}]]>
                    </condition>
                </ifPart>
            </sentry>`;
      cmmnshapedata =
        cmmnshapedata +
        `<cmmndi:CMMNShape id="CMMNShape_planItem${
          stage.slug + index
        }" cmmnElementRef="sid-${stage.slug + index}">
                    <dc:Bounds height="${item.h}" width="${item.w}" x="${
          item.x
        }" y="${item.y}"></dc:Bounds>
                    <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
                </cmmndi:CMMNShape>`;
    });
    stagedata =
      stagedata +
      `<planItem id="planItem${stage.slug}" name="${
        stage.slug
      }" definitionRef="${stage.slug}">
            ${
              stage.repetetion
                ? `<itemControl>
                <repetitionRule flowable:counterVariable="repetitionCounter">
                    <extensionElements></extensionElements>
                    <condition><![CDATA[${condition}]]></condition>
                </repetitionRule>
            </itemControl>`
                : ""
            }
            ${entryCriterionData}
          </planItem>`;
  });
  return stagedata + sentryData;
};

const getTaskData = (applicationDetail, caseName, stageDataValue) => {
  let stageData = "";
  let initiator = "${initiator}";
  let humanTaskDataStage = "";
  stageDataValue.map((stage, index) => {
    let condition =
      "$" + `{repetitionCounter < ${stage.repetitionCounter || 10}}`;
    let planItemData = "";
    let sentryData = "";
    let humanTaskData = "";
    cmmnshapedata =
      cmmnshapedata +
      `<cmmndi:CMMNShape id="CMMNShape_${stage.slug}" cmmnElementRef="planItem${stage.slug}">
          <dc:Bounds height="${stage.h}" width="${stage.w}" x="${stage.x}" y="${stage.y}"></dc:Bounds>
          <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
        </cmmndi:CMMNShape>`;
    if (stage.type == "stage") {
      stage.tasks.map((task, ind) => {
        //senitry adding value adding
        const sentries = task.sentry;
        let entryCriterionData = "";
        sentries.map((item, index) => {
          let planItemOnPartData = "";
          item.edges.map((edgeel) => {
            let waypointdata = "";
            planItemOnPartData =
              planItemOnPartData +
              `<planItemOnPart id="sentryOnPart${
                stage.slug + edgeel.source + index + ind
              }" sourceRef="planItem${stage.slug + edgeel.source}">
                                    <standardEvent>${
                                      edgeel.operator
                                    }</standardEvent>
                                </planItemOnPart>`;

            edgeel.waypoints.map(
              (wp) =>
                (waypointdata =
                  waypointdata +
                  `<di:waypoint  x="${wp.x}" y="${wp.y}"></di:waypoint>`)
            );
            edgesData =
              edgesData +
              `<cmmndi:CMMNEdge id="CMMNEdge_sid-${edgeel.source}_to_${
                edgeel.target
              }${index}" cmmnElementRef="planItem${
                stage.slug + edgeel.source
              }" targetCMMNElementRef="sid-${edgeel.target + index}">
                                    <di:extension>
                                        <flowable:docker type="source" x="${
                                          edgeel.sx
                                        }" y="${edgeel.sy}"></flowable:docker>
                                        <flowable:docker type="target" x="${
                                          edgeel.tx
                                        }" y="${edgeel.ty}"></flowable:docker>
                                    </di:extension>
                                   ${waypointdata}
                                    <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
                                </cmmndi:CMMNEdge>`;
          });

          entryCriterionData =
            entryCriterionData +
            `<entryCriterion id="sid-${task.slug + index}" sentryRef="sentry${
              task.slug + index
            }"></entryCriterion>`;
          sentryData =
            sentryData +
            `<sentry id="sentry${task.slug + index}">
                            ${planItemOnPartData}
                        <ifPart>
                            <condition>
                            <![CDATA[${item.condition || ""}]]>
                            </condition>
                        </ifPart>
                    </sentry>`;
          cmmnshapedata =
            cmmnshapedata +
            `<cmmndi:CMMNShape id="CMMNShape_planItem${
              task.slug + index
            }" cmmnElementRef="sid-${task.slug + index}">
                            <dc:Bounds height="${item.h}" width="${
              item.w
            }" x="${item.x}" y="${item.y}"></dc:Bounds>
                            <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
                        </cmmndi:CMMNShape>`;
        });
        planItemData =
          planItemData +
          `<planItem id="planItem${stage.slug + task.slug}" name="${
            task.display_name
          }" definitionRef="${stage.slug + task.slug}">
                ${
                  task.repetetion
                    ? `<itemControl>
                    <repetitionRule flowable:counterVariable="repetitionCounter">
                        <extensionElements></extensionElements>
                        <condition><![CDATA[${condition}]]></condition>
                    </repetitionRule>
                </itemControl>`
                    : ""
                }
                ${entryCriterionData}
              </planItem>`;

        let blockedonData = "";
        task.isBlockedOn.map((isBlockedOnEl) => {
          isBlockedOnEl.map((el) => {
            blockedonData =
              blockedonData +
              `<flowable:taskListener event="complete" class="org.flowable.ui.application.task.listener.ValidateTaskBeforeClose">
                          <flowable:field name="taskName">
                              <flowable:string>
                                  <![CDATA[${el.taskname}]]>
                              </flowable:string>
                          </flowable:field>
                          <flowable:field name="whenEvent">
                              <flowable:string>
                                  <![CDATA[${el.on}]]>
                              </flowable:string>
                          </flowable:field>
                      </flowable:taskListener>`;
          });
        });
        let actionsData = "";
        task.actions.map((actionel) => {
          actionsData =
            actionsData +
            `<flowable:taskListener event="${
              actionel.find((item) => item.subType === "When")?.on ===
              "complete"
                ? "complete"
                : ""
            }" class="org.flowable.ui.application.task.listener.SetVarriable">
                      <flowable:field name="variables">
                          <flowable:string>
                              <![CDATA[ ${getActionCondition(actionel)}]]>
                          </flowable:string>
                      </flowable:field>
                  </flowable:taskListener>`;
        });
        humanTaskData =
          humanTaskData +
          `<humanTask id="${stage.slug + task.slug}" name="${
            task.display_name
          }" flowable:assignee="${initiator}" flowable:formKey="" flowable:formFieldValidation="true">
                   <extensionElements>
                  <modeler:flowable-idm-initiator xmlns:modeler="http://flowable.org/modeler">
                      <![CDATA[true]]>
                  </modeler:flowable-idm-initiator>
                  <flowable:taskListener event="create" class="org.flowable.ui.application.TriggerTemporalFlow"></flowable:taskListener>
                  ${blockedonData}
                  ${actionsData}
                  <flowable:taskListener event="complete" class="org.flowable.ui.application.TriggerTemporalFlow"></flowable:taskListener>
              </extensionElements>
          </humanTask>`;
        cmmnshapedata =
          cmmnshapedata +
          `<cmmndi:CMMNShape id="CMMNShape_${
            stage.slug + task.slug
          }" cmmnElementRef="planItem${stage.slug + task.slug}">
                  <dc:Bounds height="${task.h}" width="${task.w}" x="${
            task.x
          }" y="${task.y}"></dc:Bounds>
                  <cmmndi:CMMNLabel></cmmndi:CMMNLabel>
                </cmmndi:CMMNShape>`;
      });

      stageData =
        stageData +
        `<stage id="${stage.slug}stage" name="${
          stage.primary ? applicationDetail.slug + caseName : stage.slug
        }">` +
        ` <extensionElements>
                <flowable:planItemLifecycleListener sourceState="available" targetState="active" class="org.flowable.ui.application.lifecycle.listener.TemporalListener"></flowable:planItemLifecycleListener>
              </extensionElements>` +
        planItemData +
        sentryData +
        humanTaskData +
        `</stage>`;
    } else {
      let blockedonData = "";
      stage.isBlockedOn.map((isBlockedOnEl) => {
        isBlockedOnEl.map((el) => {
          blockedonData =
            blockedonData +
            `<flowable:taskListener event="complete" class="org.flowable.ui.application.task.listener.ValidateTaskBeforeClose">
                      <flowable:field name="taskName">
                          <flowable:string>
                              <![CDATA[${el.taskname}]]>
                          </flowable:string>
                      </flowable:field>
                      <flowable:field name="whenEvent">
                          <flowable:string>
                              <![CDATA[${el.on}]]>
                          </flowable:string>
                      </flowable:field>
                  </flowable:taskListener>`;
        });
      });
      let actionsData = "";
      stage.actions.map((actionel) => {
        actionsData =
          actionsData +
          `<flowable:taskListener event="${
            actionel.find((item) => item.subType === "When")?.on === "complete"
              ? "complete"
              : ""
          }" class="org.flowable.ui.application.task.listener.SetVarriable">
                  <flowable:field name="variables">
                      <flowable:string>
                          <![CDATA[ ${getActionCondition(actionel)}]]>
                      </flowable:string>
                  </flowable:field>
              </flowable:taskListener>`;
      });

      humanTaskDataStage =
        humanTaskDataStage +
        `<humanTask id="${stage.slug}" name="${stage.display_name}" flowable:assignee="${initiator}" flowable:formKey="" flowable:formFieldValidation="true">
           <extensionElements>
          <modeler:flowable-idm-initiator xmlns:modeler="http://flowable.org/modeler">
              <![CDATA[true]]>
          </modeler:flowable-idm-initiator>
          <flowable:taskListener event="create" class="org.flowable.ui.application.TriggerTemporalFlow"></flowable:taskListener>
          ${blockedonData}
          ${actionsData}
          <flowable:taskListener event="complete" class="org.flowable.ui.application.TriggerTemporalFlow"></flowable:taskListener>
      </extensionElements>
  </humanTask>`;
    }
  });
  return stageData + humanTaskDataStage;
};
const getRelativePosition = (task, sibling, taskname) => {
  const taskx = task.x;
  const tasky = task.y;
  const siblingx = sibling.x;
  const siblingy = sibling.y;
  let position = "";
  if (siblingy > tasky) {
    position = position + "bottom";
  } else {
    position = position + "top";
  }
  if (siblingx > taskx) {
    position = position + "right";
  } else {
    position = position + "left";
  }
  return position;
};
const calculationEdges = (data, applicationDetail, caseName) => {
  let values = data.map((task, index) => {
    let sentryTopCount = 0;
    let sentryBtmCount = 0;
    let sentryLeftCount = 0;
    let sentryRightCOunt = 0;
    let sentrydata = [];
    let edgesdata = [];
    if (index == 0) {
      const sentrytemp = {
        x: null,
        y: null,
        w: 14,
        h: 22,
        condition: "",
        edges: [],
      };
      if (task.type == "stage") {
        sentrytemp.x = task.tl_x;
        sentrytemp.y = task.tl_y;
      } else {
        sentrytemp.x = task.tl_x - 7;
        sentrytemp.y = task.tl_y - 11;
      }
      // applicationDetail.slug + caseName
      const edgeTemp = {
        sx: null,
        sy: null,
        tx: null,
        ty: null,
        waypoints: [],
        source: applicationDetail.slug + caseName,
        target: task.slug,
        operator: "start",
      };
      edgeTemp.sx = 8;
      edgeTemp.sy = 10;
      edgeTemp.tx = task.tl_x - 20;
      edgeTemp.ty = task.tl_y;
      edgeTemp.waypoints = [
        {
          x: 93,
          y: 80,
        },
        {
          x: 60,
          y: 80,
        },
      ];
      sentrytemp.edges.push(edgeTemp);
      sentrytemp.condition = task.isDefaultCondition;
      sentrydata.push(sentrytemp);
    }
    task.rules.map((newRules) => {
      let rule = newRules.filter((item) => item.subType == "When");
      if (rule.length == 1) {
        const event = rule[0];
        if (event.taskname == task.slug) {
          const sentrytemp = {
            x: null,
            y: null,
            w: 14,
            h: 22,
            condition: "",
            edges: [],
          };
          const edgeTemp = {
            sx: null,
            sy: null,
            tx: null,
            ty: null,
            waypoints: [],
            source: task.slug,
            target: task.slug,
            operator: event.on,
          };
          sentrytemp.condition = sentryCondition(newRules);
          sentrytemp.x = task.tr_x - 2 * 14;
          sentrytemp.y = task.tr_y - 11;
          edgeTemp.sx = task.tr_x - task.tl_x - 1;
          edgeTemp.sy = (task.bl_y - task.tl_y) / 4;
          edgeTemp.tx = 7.0;
          edgeTemp.ty = 0.0;
          edgeTemp.waypoints = [
            {
              x: task.tr_x,
              y: task.tr_y + (task.br_y - task.tr_y) / 4,
            },
            {
              x: task.tr_x + 10,
              y: task.tr_y + (task.br_y - task.tr_y) / 4,
            },
            {
              x: task.tr_x + 10,
              y: task.tr_y - 11,
            },
            {
              x: task.tr_x - 2 * 14 - 7,
              y: task.tr_y - 11,
            },
          ];
          sentrytemp.edges.push(edgeTemp);
          sentrydata.push(sentrytemp);

          sentryTopCount++;
        } else {
          const sibling = data.find((task) => task.slug == event.taskname);
          const position = getRelativePosition(task, sibling, event.taskname);
          const sentrytemp = {
            x: null,
            y: null,
            w: 14,
            h: 22,
            condition: "",
            edges: [],
          };
          const edgeTemp = {
            sx: null,
            sy: null,
            tx: null,
            ty: null,
            waypoints: [],
            source: sibling.slug,
            target: task.slug,
            operator: event.on,
          };
          sentrytemp.condition = sentryCondition(newRules);
          switch (position) {
            case "topright":
              sentrytemp.x = task.tr_x - (sentryTopCount + 3) * 14;
              sentrytemp.y = task.tr_y - 11;
              edgeTemp.sx = 1;
              edgeTemp.sy =
                sibling.bl_y - sibling.tl_y - (sibling.bl_y - sibling.tl_y) / 4;
              edgeTemp.tx = 8.0;
              edgeTemp.ty = 10.0;
              edgeTemp.waypoints = [
                {
                  x: sibling.tl_x,
                  y:
                    sibling.tl_y +
                    (sibling.bl_y - sibling.tl_y) -
                    (sibling.bl_y - sibling.tl_y) / 4,
                },
                {
                  x: task.tr_x - (sentryTopCount + 3) * 14 + 7,
                  y:
                    sibling.tl_y +
                    sibling.bl_y -
                    sibling.tl_y -
                    (sibling.bl_y - sibling.tl_y) / 4,
                },
                {
                  x: task.tr_x - (sentryTopCount + 3) * 14 + 7,
                  y: task.tr_y - 11,
                },
              ];
              sentrytemp.edges.push(edgeTemp);
              sentryTopCount++;
              break;
            case "topleft":
              sentrytemp.x = task.tr_x - (sentryTopCount + 3) * 14;
              sentrytemp.y = task.tr_y - 11;
              edgeTemp.sx = sibling.tr_x - sibling.tl_x - 1;
              edgeTemp.sy =
                sibling.br_y - sibling.tr_y - (sibling.br_y - sibling.tr_y) / 4;
              edgeTemp.tx = 8.0;
              edgeTemp.ty = 10.0;
              edgeTemp.waypoints = [
                {
                  x: sibling.tr_x,
                  y:
                    sibling.tr_y +
                    (sibling.br_y - sibling.tr_y) -
                    (sibling.br_y - sibling.tr_y) / 4,
                },
                {
                  x: task.tr_x - (sentryTopCount + 3) * 14 + 7,
                  y:
                    sibling.tr_y +
                    (sibling.br_y - sibling.tr_y) -
                    (sibling.br_y - sibling.tr_y) / 4,
                },
                {
                  x: task.tr_x - (sentryTopCount + 3) * 14 + 7,
                  y: task.tr_y + 11,
                },
              ];
              sentrytemp.edges.push(edgeTemp);
              sentryTopCount++;
              break;
            case "bottomright":
              sentrytemp.x = task.br_x - (sentryBtmCount + 3) * 14;
              sentrytemp.y = task.br_y - 11;
              edgeTemp.sx = 1;
              edgeTemp.sy =
                sibling.bl_y - sibling.tl_y - (sibling.bl_y - sibling.tl_y) / 4;
              edgeTemp.tx = 8.0;
              edgeTemp.ty = 10.0;
              edgeTemp.waypoints = [
                {
                  x: sibling.tl_x,
                  y:
                    sibling.tl_y +
                    (sibling.bl_y - sibling.tl_y) -
                    (sibling.bl_y - sibling.tl_y) / 4,
                },
                {
                  x: task.tr_x - (sentryBtmCount + 3) * 14 + 7,
                  y:
                    sibling.tl_y +
                    sibling.bl_y -
                    sibling.tl_y -
                    (sibling.bl_y - sibling.tl_y) / 4,
                },
                {
                  x: task.tr_x - (sentryBtmCount + 3) * 14 + 8,
                  y: task.tr_y + 11,
                },
              ];
              sentrytemp.edges.push(edgeTemp);
              sentryBtmCount++;
              break;
            case "bottomleft":
              sentrytemp.x = task.br_x - (sentryBtmCount + 3) * 14;
              sentrytemp.y = task.br_y - 11;
              edgeTemp.sx = sibling.tr_x - sibling.tl_x - 1;
              edgeTemp.sy =
                sibling.bl_y - sibling.tl_y - (sibling.bl_y - sibling.tl_y) / 4;
              edgeTemp.tx = 8.0;
              edgeTemp.ty = 10.0;
              edgeTemp.waypoints = [
                {
                  x: sibling.tr_x,
                  y:
                    sibling.tr_y +
                    (sibling.br_y - sibling.tr_y) -
                    (sibling.br_y - sibling.tr_y) / 4,
                },
                {
                  x: task.tr_x - (sentryBtmCount + 3) * 14 + 7,
                  y:
                    sibling.tr_y +
                    (sibling.br_y - sibling.tr_y) -
                    (sibling.br_y - sibling.tr_y) / 4,
                },
                {
                  x: task.tr_x - (sentryBtmCount + 3) * 14 + 7,
                  y: task.tr_y + 11,
                },
              ];
              sentrytemp.edges.push(edgeTemp);
              sentryBtmCount++;
              sentryBtmCount++;
          }
          sentrydata.push(sentrytemp);
        }
      } else {
        let pointsCheck = [0, 0, 0, 0];
        const positionMap = {
          topright: 0,
          topleft: 1,
          bottomright: 2,
          bottomleft: 3,
        };
        const indexToPositionMap = {
          0: "topright",
          1: "topleft",
          2: "bottomright",
          3: "bottomleft",
        };
        let siblingRelativePositions = {};
        rule.map((ruleitem) => {
          const sibling = data.find((task) => task.slug == ruleitem.taskname);
          const position = getRelativePosition(
            task,
            sibling,
            ruleitem.taskname
          );
          siblingRelativePositions = {
            ...siblingRelativePositions,
            [sibling.slug]: position,
          };
          pointsCheck[positionMap[position]]++;
        });

        const highestIndex = pointsCheck.reduce(
          (highestIndex, currentNumber, currentIndex, array) => {
            if (currentNumber > array[highestIndex]) {
              return currentIndex;
            } else {
              return highestIndex;
            }
          },
          0
        );

        const sentryposition = indexToPositionMap[highestIndex].includes("left")
          ? "left"
          : "right";
        const sentrytemp = {
          x: null,
          y: null,
          w: 14,
          h: 22,
          condition: "",
          edges: [],
        };
        sentrytemp.condition = sentryCondition(newRules);
        if (sentryposition == "left") {
          sentrytemp.x = task.tl_x + 7;
          sentrytemp.y = task.tl_y + (sentryLeftCount + 1) * 22;
          rule.map((ruleitem) => {
            const sibling = data.find((task) => task.slug == ruleitem.taskname);
            let edgeTemp = {
              sx: null,
              sy: null,
              tx: null,
              ty: null,
              waypoints: [],
              source: sibling.slug,
              target: task.slug,
              operator: ruleitem.on,
            };
            // ----------shu--------
            if (ruleitem.taskname === task.slug) {
              edgeTemp.sx = (task.tr_x - task.tl_x) / 4;
              edgeTemp.sy = 1;
              edgeTemp.tx = 8.0;
              edgeTemp.ty = 10.0;
              edgeTemp.waypoints = [
                {
                  x: task.tl_x,
                  y: task.tl_y + (task.bl_y - task.tl_y) / 4,
                },
                {
                  x: task.tl_x - 30,
                  y: task.tl_y + (task.bl_y - task.tl_y) / 4,
                },
                {
                  x: task.tl_x - 30,
                  y: task.tl_y,
                },
                {
                  x: task.tl_x - 7,
                  y: task.tl_y + 11,
                },
              ];

              sentrytemp.edges.push(edgeTemp);
            } else {
              if (siblingRelativePositions[sibling.slug].includes("left")) {
                if (siblingRelativePositions[sibling.slug].includes("bottom")) {
                  edgeTemp.sx = (sibling.tr_x - sibling.tl_x) / 4;
                  edgeTemp.sy = 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: (sibling.tr_x - sibling.tl_x) / 4,
                      y: sibling.tl_y,
                    },
                    {
                      x: sibling.tl_x + (sibling.tr_x - sibling.tl_x) / 4,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                    {
                      x: task.tl_x - 11,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                } else {
                  edgeTemp.sx = (sibling.br_x - sibling.bl_x) / 4;
                  edgeTemp.sy = sibling.br_y - sibling.tl_y - 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: sibling.bl_x + (sibling.br_x - sibling.bl_x) / 4,
                      y: sibling.bl_y,
                    },
                    {
                      x: sibling.bl_x + (sibling.br_x - sibling.bl_x) / 4,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                    {
                      x: task.bl_x - 11,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                }
              } else {
                if (siblingRelativePositions[sibling.slug].includes("bottom")) {
                  edgeTemp.sx = (sibling.tr_x - sibling.tl_x) / 4;
                  edgeTemp.sy = 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: (sibling.tr_x - sibling.tl_x) / 4,
                      y: sibling.tl_y,
                    },
                    {
                      x: task.tl_x - 11,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                } else {
                  edgeTemp.sx = (sibling.br_x - sibling.bl_x) / 4;
                  edgeTemp.sy = sibling.br_y - sibling.tl_y - 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: sibling.bl_x + (sibling.br_x - sibling.bl_x) / 4,
                      y: sibling.bl_y,
                    },
                    {
                      x: task.bl_x - 11,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                }
              }
            }
          });
        } else {
          sentrytemp.x = task.tr_x - 7;
          sentrytemp.y = task.tr_y + (sentryLeftCount + 1) * 22;
          rule.map((ruleitem) => {
            const sibling = data.find((task) => task.slug == ruleitem.taskname);
            let edgeTemp = {
              sx: null,
              sy: null,
              tx: null,
              ty: null,
              waypoints: [],
              source: sibling.slug,
              target: task.slug,
              operator: ruleitem.on,
            };
            //************shu********/
            if (ruleitem.taskname === task.slug) {
              edgeTemp.sx = (task.tr_x - task.tl_x) / 4;
              edgeTemp.sy = 1;
              edgeTemp.tx = 8.0;
              edgeTemp.ty = 10.0;
              edgeTemp.waypoints = [
                {
                  x: task.tr_x - (task.tr_x - task.tl_x) / 4,
                  y: task.tr_y,
                },
                {
                  x: task.tr_x - (task.tr_x - task.tl_x) / 4,
                  y: task.tr_y - 30,
                },
                {
                  x: task.tr_x + 11,
                  y: task.tr_y - 30,
                },
                {
                  x: task.tr_x - 7,
                  y: task.tr_y + 11,
                },
              ];

              sentrytemp.edges.push(edgeTemp);
            } else {
              if (siblingRelativePositions[sibling.slug].includes("right")) {
                if (siblingRelativePositions[sibling.slug].includes("bottom")) {
                  edgeTemp.sx = (sibling.tr_x - sibling.tl_x) / 4;
                  edgeTemp.sy = 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: (sibling.tr_x - sibling.tl_x) / 4,
                      y: sibling.tl_y,
                    },
                    {
                      x: sibling.tl_x + (sibling.tr_x - sibling.tl_x) / 4,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                    {
                      x: task.tl_x - 11,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                } else {
                  edgeTemp.sx = (sibling.br_x - sibling.bl_x) / 4;
                  edgeTemp.sy = sibling.br_y - sibling.tl_y - 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: sibling.bl_x + (sibling.br_x - sibling.bl_x) / 4,
                      y: sibling.bl_y,
                    },
                    {
                      x: sibling.bl_x + (sibling.br_x - sibling.bl_x) / 4,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                    {
                      x: task.bl_x - 11,
                      y: task.tl_y + (sentryLeftCount + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                }
              } else {
                if (siblingRelativePositions[sibling.slug].includes("bottom")) {
                  edgeTemp.sx = (sibling.tr_x - sibling.tl_x) / 4;
                  edgeTemp.sy = 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: sibling.tr_x,
                      y: sibling.tr_y + (sibling.br_y - sibling.tr_y) / 4,
                    },
                    {
                      x: task.tr_x + 11,
                      y: sibling.tr_y + (sibling.br_y - sibling.tr_y) / 4,
                    },
                    {
                      x: task.tr_x + 11,
                      y: task.tr_y + (sentryRightCOunt + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                } else {
                  edgeTemp.sx = (sibling.br_x - sibling.bl_x) / 4;
                  edgeTemp.sy = sibling.br_y - sibling.tl_y - 1;
                  edgeTemp.tx = 8.0;
                  edgeTemp.ty = 10.0;
                  edgeTemp.waypoints = [
                    {
                      x: sibling.tr_x,
                      y: sibling.tr_y + (sibling.br_y - sibling.tr_y) / 4,
                    },
                    {
                      x: task.tr_x + 11,
                      y: sibling.tr_y + (sibling.br_y - sibling.tr_y) / 4,
                    },
                    {
                      x: task.tr_x + 11,
                      y: task.tr_y + (sentryRightCOunt + 1) * 22 + 11,
                    },
                  ];
                  sentrytemp.edges.push(edgeTemp);
                }
              }
            }
          });
        }
        sentrydata.push(sentrytemp);
      }
    });
    return {
      ...task,
      sentry: sentrydata,
    };
  });
  return values;
};

const getActionCondition = (item) => {
  let where = item
    .filter((item) => item.subType === "Where")
    .reduce((acc, curr) => {
      return (acc = [
        ...acc,
        {
          key: "_outcome",
          value: curr.on,
          op: curr.op == "notEquals" ? "noteq" : "eq",
        },
      ]);
    }, []);

  let then = item
    .filter((item) => item.subType === "Then")
    .reduce((acc, curr) => {
      return (acc = [
        ...acc,
        {
          key: "_status",
          value: curr.on,
        },
      ]);
    }, []);
  let template = [
    {
      conditions: where,
      output: then,
    },
  ];
  return JSON.stringify(template);
};
const sentryCondition = (rules) => {
  let conditionRule = rules.filter((item) => item.subType == "Where") || [];
  let condition_ = "";
  if (conditionRule.length > 1) {
    conditionRule.map((item, index) => {
      condition_ =
        condition_ +
        (index == 0 ? "" : item.operator == "AND" ? "&&" : "||") +
        `vars:${item.op}(_outcome,"${item.on}")`;
    });
  } else if (conditionRule.length == 1) {
    condition_ = `vars:${conditionRule[0].op}(_outcome,"${conditionRule[0].on}")`;
  }
  return condition_ ? "${" + condition_ + "}" : "";
};

export const makeWorkflow = ({
  objects,
  dispatch,
  application_id,
  type = null,
}) => {
  try {
    let taskGroupedBySlug = indexBy(
      objects.reduce((acc, curr) => {
        if (curr.type === "task") {
          acc.push({
            ...coordrinateKeys,
            actions: [],
            isBlockedOn: [],
            rules: [],
            unmapped: true,
            slug: curr.slug,
            display_name: curr.name,
            taskname: curr.slug,
            parent: curr.parent,
            is_update: true,
            sentry: [],
            tasks: [],
            untouched: true,
            isDefault: false,
            isDefaultCondition: "",
            repetetion: true,
            manualActivation: false,
            type: "task",
          });
        }
        return acc;
      }, []),
      (obj) => obj.slug
    );

    let defaultCases = objects
      .filter((el) => el.type === "workitem")
      .reduce((acc, curr) => {
        let relationship = curr.relationship.reduce(
          (accu, { destination_object_slug }) => {
            if (taskGroupedBySlug[destination_object_slug]) {
              accu.push(destination_object_slug);
            }
            return accu;
          },
          []
        );
        let obj = {
          name: curr.name,
          slug: curr.slug,
          uuid: uuidv4(),
          cmmnId: "",
          deploymentId: "",
          relationship,
          stages: [],
          tasks: initialTasks({ relationship, taskGroupedBySlug, objects }),
        };
        if (type) acc.push({ ...obj, new: true });
        else acc.push(obj);
        return acc;
      }, []);
    return defaultCases;
  } catch (error) {
    console.error(error);
  }
};

const initialTasks = ({ relationship, taskGroupedBySlug, objects }) => {
  try {
    let tasks = relationship.reduce((acc, curr) => {
      if (taskGroupedBySlug[curr]) acc = [...acc, taskGroupedBySlug[curr]];
      return acc;
    }, []);
    for (let i = 1; i < relationship.length; i++) {
      let options = objects.find((el) => el.slug === tasks[i - 1].taskname).maps
        .status;
      let rules = [
        [
          {
            type: "Starts",
            subType: "When",
            taskname: tasks[i - 1].taskname,
            operator: "AND",
            on: "complete",
            summary: "",
            uuid: uuidv4(),
          },
          {
            type: "Starts",
            subType: "Where",
            taskname: tasks[i - 1].taskname,
            operator: "AND",
            on: options.find((option) => option.amo_name === "completed")
              .loco_name,
            summary: "",
            attribute: "status",
            op: "equals",
            uuid: uuidv4(),
          },
        ],
      ];
      tasks[i] = { ...tasks[i], rules: rules };
    }
    return tasks || [];
  } catch (error) {
    console.error(error);
  }
};
