const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const target = "https://boxfox.in/wp-content/uploads/2022/11/Mailer_Box_Mockup_1-copy-scaled.jpg";
            if (content.includes(target)) {
                content = content.split(target).join("/BOXFOX-1.png");
                fs.writeFileSync(fullPath, content);
                console.log("Updated", fullPath);
            }
        }
    }
}
replaceInDir(path.join(process.cwd(), 'app'));
