// 1. Import the required Node.js modules
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// 2. Set up the server and data file locations
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'employees.json');

// 3. Make sure the data folder exists
fs.mkdirSync(DATA_DIR, { recursive: true });

// 4. Create sample records if the JSON file does not exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// 5. Functions to read and save employee records
const readEmployees = () =>
  JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

const writeEmployees = (rows) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));

// 6. Tell the browser which type of file is being sent
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

// 7. Send a response to the client
function send(res, status, body,
              type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });

  res.end(
    type.startsWith('application/json')
      ? JSON.stringify(body)
      : body
  );
}

// 8. Read JSON sent by the frontend
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', chunk => {
      raw += chunk;

      if (raw.length > 1e6) {
        reject(new Error('Request too large'));
      }
    });

    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

// 9. Validate employee information
function validate(input) {
  const errors = [];

  for (const key of [
    'name', 'email', 'department',
    'role', 'phone', 'status'
  ]) {
    if (
      typeof input[key] !== 'string' ||
      !input[key].trim()
    ) {
      errors.push(`${key} is required`);
    }
  }

  if (
    input.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
  ) {
    errors.push('email must be valid');
  }

  return errors;
}

// 10. Create the HTTP server
const server = http.createServer(async (req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`
  );

  const pathname = decodeURIComponent(url.pathname);

  try {
    // Handle employee API requests
    if (pathname.startsWith('/api/employees')) {
      const parts = pathname.split('/').filter(Boolean);

      const id =
        parts.length >= 3 ? Number(parts[2]) : null;

      let rows = readEmployees();

      // READ ALL EMPLOYEES, WITH OPTIONAL SEARCH
      if (req.method === 'GET' && id === null) {
        const q = (
          url.searchParams.get('search') || ''
        ).toLowerCase();

        const filtered = q
          ? rows.filter(e =>
              [
                e.name,
                e.email,
                e.department,
                e.role,
                e.status
              ].some(v =>
                v.toLowerCase().includes(q)
              )
            )
          : rows;

        return send(res, 200, filtered);
      }

      // READ ONE EMPLOYEE
      if (req.method === 'GET' && id !== null) {
        const row = rows.find(e => e.id === id);

        return row
          ? send(res, 200, row)
          : send(res, 404, {
              error: 'Employee not found'
            });
      }

      // CREATE EMPLOYEE
      if (
        req.method === 'POST' &&
        parts.length === 2
      ) {
        const input = await readBody(req);
        const errors = validate(input);

        if (errors.length) {
          return send(res, 400, { errors });
        }

        const row = {
          id: rows.reduce(
            (m, e) => Math.max(m, e.id), 0
          ) + 1,

          ...Object.fromEntries(
            [
              'name', 'email', 'department',
              'role', 'phone', 'status'
            ].map(k => [k, input[k].trim()])
          )
        };

        rows.push(row);
        writeEmployees(rows);

        return send(res, 201, row);
      }

      // UPDATE EMPLOYEE
      if (req.method === 'PUT' && id !== null) {
        const index = rows.findIndex(e => e.id === id);

        if (index < 0) {
          return send(res, 404, {
            error: 'Employee not found'
          });
        }

        const input = await readBody(req);
        const errors = validate(input);

        if (errors.length) {
          return send(res, 400, { errors });
        }

        rows[index] = {
          id,
          ...Object.fromEntries(
            [
              'name', 'email', 'department',
              'role', 'phone', 'status'
            ].map(k => [k, input[k].trim()])
          )
        };

        writeEmployees(rows);

        return send(res, 200, rows[index]);
      }

      // DELETE EMPLOYEE
      if (req.method === 'DELETE' && id !== null) {
        const next = rows.filter(e => e.id !== id);

        if (next.length === rows.length) {
          return send(res, 404, {
            error: 'Employee not found'
          });
        }

        writeEmployees(next);

        return send(res, 200, {
          message: 'Employee deleted',
          id
        });
      }

      return send(res, 405, {
        error: 'Method not allowed'
      });
    }

    // Serve the frontend files
    const relative =
      pathname === '/'
        ? 'index.html'
        : pathname.replace(/^\/+/, '');

    const publicDir = path.resolve(ROOT, 'public');
    const filePath = path.resolve(publicDir, relative);

    if (!filePath.startsWith(publicDir + path.sep)) {
      return send(res, 403, 'Forbidden',
        'text/plain; charset=utf-8');
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        return send(res, 404, 'Not found',
          'text/plain; charset=utf-8');
      }

      send(
        res,
        200,
        content,
        mime[path.extname(filePath)] ||
          'application/octet-stream'
      );
    });

  } catch (err) {
    send(res, 400, {
      error: err.message || 'Request failed'
    });
  }
});

// 11. Start the server
server.listen(PORT, () => {
  console.log(
    `Employee Management System running at http://localhost:${PORT}`
  );
});