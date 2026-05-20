let select = "";
let selectedStage = 0;

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