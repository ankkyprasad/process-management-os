const formAddProcessEl = document.getElementById("form-add-process");
const processTableBodyEl = document.getElementById("process-table-body");
const resultTableBodyEl = document.getElementById("result-table-body");
const resultTableHeaderEl = document.getElementById("result-table-header");
const resetButtonEl = document.getElementById("btn-reset");
const runButtonEl = document.getElementById("btn-run");

const systemProcess = [];
let pid = 1;

class Process {
  constructor(pid, arrivalTime, burstTime, priority = -1) {
    this.pid = pid;
    this.arrivalTime = parseInt(arrivalTime);
    this.burstTime = parseInt(burstTime);
    this.priority = parseInt(priority);
    this.executed = false;
    this.completedAt = -1;
    this.tat = -1;
    this.waitingTime = -1;
  }
}

class ProcessQueue {
  constructor(mode = 0) {
    this.arr = [];
    this.mode = mode; // mode = 0 based on burst time, mode = 1 based on priority
  }

  enqueue(p1) {
    this.arr.push(p1);
    for (let i = this.arr.length - 2; i >= 0; i--) {
      if (
        this.mode === 0 &&
        (this.arr[i].burstTime < this.arr[i + 1].burstTime ||
          (this.arr[i].burstTime === this.arr[i + 1].burstTime &&
            this.arr[i].arrivalTime < this.arr[i + 1].arrivalTime))
      ) {
        break;
      }

      if (
        this.mode === 1 &&
        (this.arr[i].priority < this.arr[i + 1].priority ||
          (this.arr[i].priority === this.arr[i + 1].priority &&
            this.arr[i].arrivalTime < this.arr[i + 1].arrivalTime))
      ) {
        break;
      }

      [this.arr[i], this.arr[i + 1]] = [this.arr[i + 1], this.arr[i]];
    }
  }

  dequeue() {
    return this.arr.shift();
  }

  empty() {
    return this.arr.length === 0;
  }
}

resetButtonEl.addEventListener("click", () => {
  systemProcess.length = 0;
  processTableBodyEl.innerHTML = "";
  resultTableBodyEl.innerHTML = "";
  resultTableHeaderEl.innerHTML = "<tr></tr>";
});

formAddProcessEl.addEventListener("submit", (e) => {
  e.preventDefault();

  const arrivalTime = e.target[0].value;
  const burstTime = e.target[1].value;

  if (!arrivalTime || !burstTime) return;

  for (let i = 0; i < 2; i++) e.target[i].value = "";
  systemProcess.push(new Process(pid, arrivalTime, burstTime));
  generateTable(systemProcess);
  pid++;
});

runButtonEl.addEventListener("click", () => {
  if (systemProcess.length == 0) return;
  const execution = executeProcess(systemProcess);
  const evaluation = evaluateProcess(execution);
  generateTable(evaluation, "result");
  generateGanttChart(evaluation);
});

const generateTable = (process, flag = "main") => {
  if (flag === "main") processTableBodyEl.innerHTML = "";
  else {
    resultTableBodyEl.innerHTML = "";
    resultTableHeaderEl.innerHTML = `
    <tr>
      <th>Process ID</th>
      <th>Arrival Time</th>
      <th>Burst Time</th>
      <th>Completion Time</th>
      <th>Turn Around Time</th>
      <th>Waiting Time</th>
    </tr>`;
  }

  process.forEach((p1) => {
    let data = `<tr>
    <td>${p1.pid}</td>
    <td>${p1.arrivalTime}</td>
    <td>${p1.burstTime}</td>
  `;

    if (flag === "main") {
      data += "</tr>";
      processTableBodyEl.innerHTML += data;
    } else {
      data += `
        <td>${p1.completedAt}</td>
        <td>${p1.tat}</td>
        <td>${p1.waitingTime}</td>
      </tr>
      `;
      resultTableBodyEl.innerHTML += data;
    }
  });
};

const executeProcess = (process) => {
  const q1 = new ProcessQueue();
  const res = [];

  let startTime = 0;
  let totalBurstTime = 0;
  process.forEach((p1) => {
    totalBurstTime += p1.burstTime;
  });

  while (totalBurstTime != 0) {
    process.forEach((p1) => {
      if (p1.arrivalTime <= startTime && p1.executed === false) {
        q1.enqueue(p1);
        p1.executed = true;
      }
    });

    if (q1.empty()) {
      startTime += 1;
      continue;
    }

    const currentProcess = q1.dequeue();
    totalBurstTime -= currentProcess.burstTime;
    startTime += currentProcess.burstTime;
    currentProcess.completedAt = startTime;
    res.push(currentProcess);
  }
  return res;
};

const evaluateProcess = (process) => {
  process.forEach((p1) => {
    p1.tat = p1.completedAt - p1.arrivalTime;
    p1.waitingTime = p1.tat - p1.burstTime;
  });
  return process;
};

const generateGanttChart = (process) => {
  // generate gantt chart in html
};
