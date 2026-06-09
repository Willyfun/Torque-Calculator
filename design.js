let selectedGearDesign = null;

function calculate_teeth(){
    const module = Number(document.getElementById("module").value);
    const gearRatio = Number(document.getElementById("GearRatio").value);
    const tableBody = document.getElementById("tableBody");

    if (module <= 0 || gearRatio <= 0) {
        alert("Please fill in all required fields with valid numbers.");
        return;
    }

    if (gearRatio <= 2) {
        alert("Please enter a gear ratio greater than 2.");
        return;
    }

    tableBody.innerHTML = "";
    selectedGearDesign = null;
    document.getElementById("selectedDesign").style.display = "none";

    for (let sunGearTeeth = 18; sunGearTeeth <= 40; sunGearTeeth+=2) {
        const ringGearTeeth = (gearRatio - 1) * sunGearTeeth;
        const planetGearTeeth = (ringGearTeeth - sunGearTeeth) / 2;

        const design = {
            module,
            gearRatio,
            sunGearTeeth,
            planetGearTeeth,
            ringGearTeeth,
            sunPitchDiameter: pitch_diameter.sun.formula({
                module,
                num_of_teeth: sunGearTeeth
            }),
            planetPitchDiameter: pitch_diameter.planet.formula({
                module,
                num_of_teeth: planetGearTeeth
            }),
            ringPitchDiameter: pitch_diameter.ring.formula({
                module,
                num_of_teeth: ringGearTeeth
            })
        };

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${design.sunGearTeeth}</td>
            <td>${formatNumber(design.planetGearTeeth)}</td>
            <td>${formatNumber(design.ringGearTeeth)}</td>
            <td>${formatNumber(design.sunPitchDiameter)}</td>
            <td>${formatNumber(design.planetPitchDiameter)}</td>
            <td>${formatNumber(design.ringPitchDiameter)}</td>
            <td><button type="button">Select</button></td>
        `;

        row.addEventListener("click", () => selectGearDesign(row, design));
        row.querySelector("button").addEventListener("click", (event) => {
            event.stopPropagation();
            selectGearDesign(row, design);
        });

        tableBody.appendChild(row);
    }

    document.querySelector(".option").style.display = "block";
}

function selectGearDesign(row, design) {
    selectedGearDesign = design;

    document.querySelectorAll("#tableBody tr").forEach(tableRow => {
        tableRow.classList.remove("selected-row");
    });
    row.classList.add("selected-row");

    document.getElementById("selectedDesign").style.display = "block";
    document.getElementById("selectedDesign").innerHTML = `
        <h2>Selected Gear Design</h2>
        <p>Sun Gear Teeth: ${design.sunGearTeeth}</p>
        <p>Planet Gear Teeth: ${formatNumber(design.planetGearTeeth)}</p>
        <p>Ring Gear Teeth: ${formatNumber(design.ringGearTeeth)}</p>
        <p>Sun Pitch Diameter: ${formatNumber(design.sunPitchDiameter)} mm</p>
        <p>Planet Pitch Diameter: ${formatNumber(design.planetPitchDiameter)} mm</p>
        <p>Ring Pitch Diameter: ${formatNumber(design.ringPitchDiameter)} mm</p>
    `;
}

function formatNumber(value) {
    return Number.isInteger(value) ? value : value.toFixed(2);
}

const pitch_diameter = {
    ring :{
        required:["module","num_of_teeth"],
        formula:({module, num_of_teeth})=>module*num_of_teeth,
        unit:"mm"
    },
    
    planet :{
        required:["module","num_of_teeth"],
        formula:({module, num_of_teeth})=>module*num_of_teeth,
        unit:"mm"
    },

    sun :{
        required:["module","num_of_teeth"],
        formula:({module, num_of_teeth})=>module*num_of_teeth,
        unit:"mm"
    }
};
