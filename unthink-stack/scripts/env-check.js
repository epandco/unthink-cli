// Require .env to exist when starting the stack
const path = require('path');
const fs = require('fs');

if (fs.existsSync(path.join(process.cwd(), '.env'))) {
  process.exit(0);
} else {
  console.error('\n##### ERROR: Missing .env file in path. #####\n');
  process.exit(1);
}
