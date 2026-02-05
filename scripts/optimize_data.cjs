
const fs = require('fs');
const path = require('path');

const requirementsPath = path.join(__dirname, '../data/course_requirements.json');
const rawData = fs.readFileSync(requirementsPath, 'utf8');
const requirements = JSON.parse(rawData);

const coursesDB = {}; // course_id -> { title, credits, description? }
const optimizedRequirements = {};

function processItems(items) {
    return items.map(item => {
        if (item.type === 'course') {
            // Normalize ID
            const id = item.course_id;

            // If it has an ID, store it in DB if not exists or if better data
            if (id) {
                if (!coursesDB[id]) {
                    coursesDB[id] = {
                        title: item.course_title,
                        credits: item.credits
                    };
                    if (item.description) coursesDB[id].description = item.description;
                }
                // Return a lightweight reference
                return { type: 'course', course_id: id };
            } else {
                // Keep as is if no ID (sometimes happens with ad-hoc courses)
                return item;
            }
        }
        return item;
    });
}

function processGroup(group) {
    const newGroup = { ...group };
    if (newGroup.items) {
        newGroup.items = processItems(newGroup.items);
    }
    if (newGroup.subgroups) {
        newGroup.subgroups = newGroup.subgroups.map(processGroup);
    }
    return newGroup;
}

for (const [programId, groups] of Object.entries(requirements)) {
    optimizedRequirements[programId] = groups.map(processGroup);
}

// Write the new files
const coursesPath = path.join(__dirname, '../data/courses_db.json');
const optReqPath = path.join(__dirname, '../data/course_requirements_optimized.json');

fs.writeFileSync(coursesPath, JSON.stringify(coursesDB, null, 2));
fs.writeFileSync(optReqPath, JSON.stringify(optimizedRequirements, null, 2)); // Formatted for readability

console.log(`Original size: ${rawData.length} bytes`);
console.log(`Courses DB size: ${fs.statSync(coursesPath).size} bytes`);
console.log(`Optimized Req size: ${fs.statSync(optReqPath).size} bytes`);
