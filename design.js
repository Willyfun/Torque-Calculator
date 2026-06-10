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

    showOnlySelectedRow(design);

    document.getElementById("selectedDesign").style.display = "block";
    document.getElementById("selectedDesign").innerHTML = `
        <h2>Selected Gear Design</h2>
        <div class="gear-preview-grid">
            ${createGearPreview("Sun Gear", design.sunGearTeeth, design.sunPitchDiameter, "sun")}
            ${createGearPreview("Planet Gear", design.planetGearTeeth, design.planetPitchDiameter, "planet")}
            ${createGearPreview("Ring Gear", design.ringGearTeeth, design.ringPitchDiameter, "ring")}
        </div>
        <div class="gear-diagram-grid">
            ${createToothProfileDiagram(design)}
            ${createDiameterDiagram(design)}
        </div>
        <button type="button" class="back-selection-btn" onclick="calculate_teeth()">Back to Selection Table</button>
    `;
}

function showOnlySelectedRow(design) {
    document.getElementById("tableBody").innerHTML = `
        <tr class="selected-row">
            <td>${design.sunGearTeeth}</td>
            <td>${formatNumber(design.planetGearTeeth)}</td>
            <td>${formatNumber(design.ringGearTeeth)}</td>
            <td>${formatNumber(design.sunPitchDiameter)}</td>
            <td>${formatNumber(design.planetPitchDiameter)}</td>
            <td>${formatNumber(design.ringPitchDiameter)}</td>
            <td>Selected</td>
        </tr>
    `;
}

function createGearPreview(label, teeth, pitchDiameter, type) {
    return `
        <div class="gear-preview">
            ${createGearSvg(teeth, pitchDiameter, type)}
            <h3>${label}</h3>
            <p>${formatNumber(teeth)} teeth</p>
            <p>Pitch Diameter: ${formatNumber(pitchDiameter)} mm</p>
        </div>
    `;
}

function createGearSvg(teeth, pitchDiameter, type) {
    const toothCount = Math.max(6, Math.round(teeth));
    const center = 50;
    const outerRadius = 38;
    const rootRadius = 33;
    const pitchRadius = (outerRadius + rootRadius) / 2;
    const points = createGearToothPoints(toothCount, center, rootRadius, outerRadius);

    if (type === "ring") {
        const ringOuterRadius = 42;
        const ringRootRadius = 38;
        const ringInnerToothRadius = 29;
        const ringPitchRadius = (ringRootRadius + ringInnerToothRadius) / 2;
        const ringToothPoints = createInternalGearToothPoints(toothCount, center, ringRootRadius, ringInnerToothRadius);

        return `
            <svg class="gear-picture ring-gear-picture ring-large-picture" viewBox="0 0 100 100" aria-label="${formatNumber(teeth)} tooth ring gear picture">
                ${createArrowMarker()}
                <circle class="ring-outer-body" cx="50" cy="50" r="${ringOuterRadius}"></circle>
                <polygon class="ring-inner-teeth" points="${ringToothPoints.join(" ")}"></polygon>
                <circle class="pitch-circle" cx="50" cy="50" r="${ringPitchRadius}"></circle>
                ${createPitchDiameterLabel(pitchDiameter, ringPitchRadius)}
            </svg>
        `;
    }

    return `
        <svg class="gear-picture" viewBox="0 0 100 100" aria-label="${formatNumber(teeth)} tooth gear picture">
            ${createArrowMarker()}
            <polygon points="${points.join(" ")}"></polygon>
            <circle class="pitch-circle" cx="50" cy="50" r="${pitchRadius}"></circle>
            <circle cx="50" cy="50" r="11"></circle>
            ${createPitchDiameterLabel(pitchDiameter, pitchRadius)}
        </svg>
    `;
}

function createGearToothPoints(toothCount, center, rootRadius, outerRadius) {
    const points = [];

    for (let tooth = 0; tooth < toothCount; tooth++) {
        const toothAngle = (Math.PI * 2) / toothCount;
        const baseAngle = tooth * toothAngle - Math.PI / 2;
        const angles = [
            baseAngle,
            baseAngle + toothAngle * 0.18,
            baseAngle + toothAngle * 0.42,
            baseAngle + toothAngle * 0.60,
            baseAngle + toothAngle * 0.82
        ];
        const radii = [
            rootRadius,
            outerRadius,
            outerRadius,
            rootRadius,
            rootRadius
        ];

        angles.forEach((angle, index) => {
            const radius = radii[index];
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
        });
    }

    return points;
}

function createInternalGearToothPoints(toothCount, center, rootRadius, innerToothRadius) {
    const points = [];

    for (let tooth = 0; tooth < toothCount; tooth++) {
        const toothAngle = (Math.PI * 2) / toothCount;
        const baseAngle = tooth * toothAngle - Math.PI / 2;
        const angles = [
            baseAngle,
            baseAngle + toothAngle * 0.12,
            baseAngle + toothAngle * 0.46,
            baseAngle + toothAngle * 0.58,
            baseAngle + toothAngle * 0.88
        ];
        const radii = [
            rootRadius,
            innerToothRadius,
            innerToothRadius,
            rootRadius,
            rootRadius
        ];

        angles.forEach((angle, index) => {
            const radius = radii[index];
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
        });
    }

    return points;
}

function createToothProfileDiagram(design) {
    const circularPitch = Math.PI * design.module;
    const toothThickness = circularPitch / 2;
    const addendum = design.module;
    const dedendum = 1.25 * design.module;
    const toothDepth = addendum + dedendum;

    return `
        <div class="gear-info-diagram">
            <h3>Tooth Profile</h3>
            <svg viewBox="0 0 420 190" aria-label="Tooth profile diagram">
                ${createArrowMarker()}
                <path class="tooth-fill" d="M35 155 C52 155 55 120 66 70 L108 70 C122 120 128 155 145 155 C162 155 168 120 182 70 L224 70 C238 120 244 155 262 155 L385 155 L385 170 L35 170 Z"></path>
                <path class="diagram-line" d="M35 155 C52 155 55 120 66 70 L108 70 C122 120 128 155 145 155 C162 155 168 120 182 70 L224 70 C238 120 244 155 262 155"></path>
                <line class="reference-line" x1="25" y1="110" x2="395" y2="110"></line>
                <line class="extension-line" x1="66" y1="30" x2="66" y2="70"></line>
                <line class="extension-line" x1="182" y1="30" x2="182" y2="70"></line>
                <line class="extension-line" x1="182" y1="55" x2="182" y2="70"></line>
                <line class="extension-line" x1="224" y1="55" x2="224" y2="70"></line>
                <line class="diagram-dimension open-arrow" x1="66" y1="30" x2="182" y2="30"></line>
                <line class="diagram-dimension open-arrow" x1="182" y1="55" x2="224" y2="55"></line>
                <line class="diagram-dimension" x1="332" y1="70" x2="332" y2="110"></line>
                <line class="diagram-dimension" x1="362" y1="110" x2="362" y2="155"></line>
                <line class="diagram-dimension" x1="392" y1="70" x2="392" y2="155"></line>
                <text class="diagram-label" x="86" y="22">Pitch: ${formatNumber(circularPitch)} mm</text>
                <text class="diagram-label" x="228" y="50">Tooth thickness: ${formatNumber(toothThickness)} mm</text>
                <text class="diagram-label" x="282" y="95">Addendum: ${formatNumber(addendum)} mm</text>
                <text class="diagram-label" x="282" y="140">Dedendum: ${formatNumber(dedendum)} mm</text>
                <text class="diagram-label vertical-label" x="382" y="116">Tooth depth: ${formatNumber(toothDepth)} mm</text>
                <text class="diagram-label" x="28" y="98">Reference line</text>
            </svg>
        </div>
    `;
}

function createDiameterDiagram(design) {
    const tipDiameter = design.sunPitchDiameter + (2 * design.module);
    const rootDiameter = design.sunPitchDiameter - (2 * 1.25 * design.module);

    return `
        <div class="gear-info-diagram">
            <h3>Sun Gear Diameters</h3>
            <svg viewBox="0 0 420 190" aria-label="Gear diameter diagram">
                ${createArrowMarker()}
                <circle class="diameter-tip-circle" cx="115" cy="95" r="72"></circle>
                <circle class="diameter-pitch-circle" cx="115" cy="95" r="58"></circle>
                <circle class="diameter-root-circle" cx="115" cy="95" r="45"></circle>
                <line class="gear-center-line" x1="43" y1="95" x2="187" y2="95"></line>
                <line class="gear-center-line" x1="115" y1="23" x2="115" y2="167"></line>
                <line class="diagram-dimension" x1="63" y1="43" x2="167" y2="147"></line>
                <line class="diagram-dimension" x1="115" y1="37" x2="115" y2="153"></line>
                <line class="diagram-dimension" x1="83" y1="63" x2="147" y2="127"></line>
                <text class="diagram-label" x="22" y="25">Tip diameter: ${formatNumber(tipDiameter)} mm</text>
                <text class="diagram-label" x="190" y="35">Pitch diameter: ${formatNumber(design.sunPitchDiameter)} mm</text>
                <text class="diagram-label" x="190" y="65">Root diameter: ${formatNumber(rootDiameter)} mm</text>
                <g class="simple-gear-3d">
                    <path d="M265 65 L345 35 L385 70 L305 105 Z"></path>
                    <path d="M305 105 L385 70 L385 125 L305 160 Z"></path>
                    <path d="M265 65 L305 105 L305 160 L265 120 Z"></path>
                    <line x1="285" y1="72" x2="365" y2="42"></line>
                    <line x1="300" y1="83" x2="380" y2="53"></line>
                    <line x1="315" y1="94" x2="385" y2="68"></line>
                </g>
                <line class="diagram-dimension" x1="320" y1="35" x2="384" y2="12"></line>
                <text class="diagram-label" x="350" y="18">Face width</text>
            </svg>
        </div>
    `;
}

function createArrowMarker() {
    return `
        <defs>
            <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto-start-reverse">
                <path class="arrow-head" d="M2,2 L8,5 L2,8"></path>
            </marker>
        </defs>
    `;
}

function createPitchDiameterLabel(pitchDiameter, pitchRadius) {
    const left = 50 - pitchRadius + 2;
    const right = 50 + pitchRadius - 2;

    return `
        <line class="gear-center-line" x1="14" y1="50" x2="86" y2="50"></line>
        <line class="gear-center-line" x1="50" y1="14" x2="50" y2="86"></line>
        <line class="pitch-diameter-arrow" x1="${left}" y1="50" x2="${right}" y2="50"></line>
        <rect class="pitch-label-background" x="20" y="31" width="60" height="18" rx="3"></rect>
        <text class="pitch-diameter-text" x="50" y="39">Pitch Diameter</text>
        <text class="pitch-diameter-value" x="50" y="47">${formatNumber(pitchDiameter)} mm</text>
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
