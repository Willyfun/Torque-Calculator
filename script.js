let select = "";
let selectedStage = 0;
let selectedParameter = "";
let torqueSpeedChart = null;
let speedCompareChart = null;
let ratedTorqueCompareChart = null;
let maxTorqueCompareChart = null;

const formula = {
    power :{
        required:["speed","torque"],
        formula:({speed,torque}) => (torque*speed)/9.55,
        unit:"W"
    },

    torque :{
        required:["speed","power"],
        formula:({speed,power}) => (9.55*power)/speed,
        unit:"Nm"
    },

    speed :{
        required:["torque","power"],
        formula:({torque,power}) => (9.55*power)/torque,
        unit:"RPM"
    }
};

document.addEventListener("DOMContentLoaded", populateActuatorOptions);

function populateActuatorOptions() {
    const actuatorSelect = document.getElementById("actuatorSelect");

    if (!actuatorSelect || typeof ActuatorModels === "undefined") {
        return;
    }

    ActuatorModels.forEach(actuator => {
        const option = document.createElement("option");
        option.value = actuator.id;
        option.textContent = actuator.model;
        actuatorSelect.appendChild(option);
    });
}

function loadActuatorModel() {
    const actuatorId = Number(document.getElementById("actuatorSelect").value);
    const actuator = ActuatorModels.find(item => item.id === actuatorId);

    if (!actuator) {
        document.getElementById("selectedMaxTorque").textContent = "-";
        return;
    }

    document.getElementById("power_w").value = actuator.power;
    document.getElementById("speed_rpm").value = actuator.MaxSpeed;
    document.getElementById("selectedMaxTorque").textContent = actuator.MaxTorque;
}

function chooseParameter(parameter){
    selectedParameter = parameter;

    document.querySelector(".power").style.display = "none";
    document.querySelector(".torque").style.display = "none";
    document.querySelector(".speed").style.display = "none";

    const requiredInputs = formula[parameter].required;

    requiredInputs.forEach(input => {
        document.querySelector("." + input).style.display = "block";
    });
}

function calculate_torque() {

    if(select === ""){
        alert('Please Select With Gear or No Gear');
        return;
    }

    const power_watt = Number(document.getElementById('power_w').value);
    const speed_rpm = Number(document.getElementById('speed_rpm').value);
    const resultTorqueRated = document.getElementById('result');
    const tableBody = document.getElementById('tableBody');

    
    if (power_watt <= 0 || speed_rpm <= 0) {
        alert("Please enter valid power and speed");
        return;
    }

    let gearRatio = 1;
    let efficiency = 1;

    if (select === "WithGear") {
        gearRatio = getTotalGearRatio();

        if (gearRatio === null) {
            return;
        }

        efficiency = Number(document.getElementById("efficiency").value) / 100;

        if (efficiency <= 0 || efficiency > 1) {
            alert("Please enter efficiency between 1 and 100");
            return;
        }

        document.getElementById("totalRatio").textContent = gearRatio + ":1";
    }
    const rated_torque = (60 * power_watt) / (2 * Math.PI * speed_rpm);
    const max_torque = rated_torque * 1.25;
    const newRatedTorque = rated_torque*gearRatio;
    const newMaxTorque = max_torque * gearRatio;
    const newRatedTorque_Efficiency = newRatedTorque*efficiency;
    const newMaxTorque_Efficiency = newMaxTorque*efficiency;
    const newSpeed = speed_rpm/ gearRatio;

    resultTorqueRated.textContent = rated_torque.toFixed(2);
    tableBody.innerHTML='';

    const row = document.createElement("tr");
    
    row.innerHTML = `
        <td>${power_watt}</td>
        <td>${speed_rpm}</td>
        <td>${gearRatio === 1 ? "-" : gearRatio + ':1'}</td>
        <td>${rated_torque.toFixed(2)}</td>
        <td>${max_torque.toFixed(2)}</td>
        <td>${gearRatio === 1 ? "-" : newRatedTorque.toFixed(2)}</td>
        <td>${gearRatio === 1 ? "-" : newMaxTorque.toFixed(2)}</td>
        <td>${gearRatio === 1 ? "-" : newRatedTorque_Efficiency.toFixed(2)}</td>
        <td>${gearRatio === 1 ? "-" : newMaxTorque_Efficiency.toFixed(2)}</td>
        <td>${gearRatio === 1 ? "-" : newSpeed.toFixed(2)}</td>
    `;
    
    tableBody.appendChild(row);
}

function selected(btn, option){
    select = option;

    document.querySelectorAll('.btn').forEach(b => 
        b.classList.remove('active'));
    btn.classList.add('active');

    if(option == 'WithGear'){

        document.getElementById('stage').style.display = 'block';
        document.getElementById('dropdown').style.display = 'block';

    }else if (option == 'NoGear'){

        document.getElementById('stage').style.display = 'none';
        document.getElementById('dropdown').style.display = 'none';
    }
}

function stage(btn, x){
 
    selectedStage=x;

    document.querySelectorAll('.btn').forEach(b => 
        b.classList.remove('active'));
    btn.classList.add('active');

    const gearInput = document.getElementById("gearInputs");
    gearInput.innerHTML="";

    for( let i=1; i <=selectedStage; i++)
    {
        gearInput.innerHTML+=`
        <div class="gear_stage"
            <label for="gearratio">Please Key In stage ${i} Gear Ratio</label>
                <input type="number" id="gear${i}" placeholder='e.g. 5'>   
        </div>    
        `;
        
    }
}

function getTotalGearRatio() {
    let totalGearRatio = 1;

    for (let i = 1; i <= selectedStage; i++) {
        const ratio = Number(document.getElementById(`gear${i}`).value);

        if (ratio <= 0) {
            alert(`Please enter valid gear ratio for stage ${i}`);
            return null;
        }

        totalGearRatio *= ratio;
    }

    return totalGearRatio;
}

function TorqueSpeedchart() {
    const from = Number(document.querySelector('[name="from"]').value);
    const to = Number(document.querySelector('[name="to"]').value);
    const increment = Number(document.querySelector('[name="increment"]').value);

    const power_watt = Number(document.getElementById("power_w").value);
    const speed_rpm = Number(document.getElementById("speed_rpm").value);

    if (power_watt <= 0 || speed_rpm <= 0) {
        alert("Please enter valid power and speed first.");
        return;
    }

    if (from <= 0 || to <= 0 || increment <= 0 || from >= to) {
        alert("Please enter a valid gear ratio range.");
        return;
    }

    const labels = [];
    const torqueData = [];
    const speedData = [];

    const ratedTorque = (60 * power_watt) / (2 * Math.PI * speed_rpm);

    for (let gearRatio = from; gearRatio <= to; gearRatio += increment) {
        const newTorque = ratedTorque * gearRatio;
        const newSpeed = speed_rpm / gearRatio;

        labels.push((gearRatio).toFixed(1));
        torqueData.push(newTorque.toFixed(2));
        speedData.push(newSpeed.toFixed(2));
    }

    const ctx = document.getElementById("TorqueSpeedChart");

    if (torqueSpeedChart !== null) {
        torqueSpeedChart.destroy();
    }

    torqueSpeedChart = new Chart(ctx, {
        data: {
        labels: labels,
        datasets: [
            {
            type: "bar",
            label: "Torque (Nm)",
            data: torqueData,
            yAxisID: "yTorque"
            },
            {
            type: "bar",
            label: "Speed (RPM)",
            data: speedData,
            yAxisID: "ySpeed",
            borderWidth: 2,
            tension: 0.3
            }
        ]
        },
        options: {
        responsive: true,
        scales: {
            x: {
            title: {
                display: true,
                text: "Gear Ratio"
            }
            },
            yTorque: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: {
                display: true,
                text: "Torque (Nm)"
            }
            },
            ySpeed: {
            type: "linear",
            position: "right",
            beginAtZero: true,
            title: {
                display: true,
                text: "Speed (RPM)"
            },
            grid: {
                drawOnChartArea: false
            }
            }
        }
        }
    });
}

function CompareChart(){
    const actuatorId = Number(document.getElementById("actuatorSelect").value);
    const actuator = ActuatorModels.find(item => item.id === actuatorId);

    if (!actuator) {
        alert("Please choose an actuator model first.");
        return;
    }

    if (select !== "WithGear") {
        alert("Please select With Gear and enter the gear ratio.");
        return;
    }

    const gearRatio = getTotalGearRatio();

    if (gearRatio === null) {
        return;
    }

    const efficiency = Number(document.getElementById("efficiency").value) / 100;

    if (efficiency <= 0 || efficiency > 1) {
        alert("Please enter efficiency between 1 and 100");
        return;
    }

    const originalSpeed = actuator.MaxSpeed;
    const originalRatedTorque = (60 * actuator.power) / (2 * Math.PI * actuator.MaxSpeed);
    const originalMaxTorque = actuator.MaxTorque;

    const gearboxSpeed = originalSpeed / gearRatio;
    const gearboxRatedTorque = originalRatedTorque * gearRatio * efficiency;
    const gearboxMaxTorque = originalMaxTorque * gearRatio * efficiency;

    document.getElementById("totalRatio").textContent = gearRatio + ":1";
    updateCompareTable({
        originalSpeed,
        gearboxSpeed,
        originalRatedTorque,
        gearboxRatedTorque,
        originalMaxTorque,
        gearboxMaxTorque
    });
    drawCompareChart({
        originalSpeed,
        gearboxSpeed,
        originalRatedTorque,
        gearboxRatedTorque,
        originalMaxTorque,
        gearboxMaxTorque
    });
}

function updateCompareTable(values) {
    const tableBody = document.getElementById("compareTableBody");

    tableBody.innerHTML = `
        <tr>
            <td>Speed (RPM)</td>
            <td>${values.originalSpeed.toFixed(2)}</td>
            <td>${values.gearboxSpeed.toFixed(2)}</td>
        </tr>
        <tr>
            <td>Rated Torque (Nm)</td>
            <td>${values.originalRatedTorque.toFixed(2)}</td>
            <td>${values.gearboxRatedTorque.toFixed(2)}</td>
        </tr>
        <tr>
            <td>Max Torque (Nm)</td>
            <td>${values.originalMaxTorque.toFixed(2)}</td>
            <td>${values.gearboxMaxTorque.toFixed(2)}</td>
        </tr>
    `;
}

function drawCompareChart(values) {
    speedCompareChart = drawSingleCompareChart(
        "speedCompareChart",
        speedCompareChart,
        "Speed Comparison",
        "Speed (RPM)",
        values.originalSpeed,
        values.gearboxSpeed
    );

    ratedTorqueCompareChart = drawSingleCompareChart(
        "ratedTorqueCompareChart",
        ratedTorqueCompareChart,
        "Rated Torque Comparison",
        "Rated Torque (Nm)",
        values.originalRatedTorque,
        values.gearboxRatedTorque
    );

    maxTorqueCompareChart = drawSingleCompareChart(
        "maxTorqueCompareChart",
        maxTorqueCompareChart,
        "Max Torque Comparison",
        "Max Torque (Nm)",
        values.originalMaxTorque,
        values.gearboxMaxTorque
    );
}

function drawSingleCompareChart(canvasId, chartObject, title, label, originalValue, gearboxValue) {
    const ctx = document.getElementById(canvasId);

    if (chartObject !== null) {
        chartObject.destroy();
    }

    return new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Original Model", "With Gearbox"],
            datasets: [
                {
                    label: label,
                    data: [
                        Number(originalValue.toFixed(2)),
                        Number(gearboxValue.toFixed(2))
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: label
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        }
    });
}
