import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();

router.use(express.static(path.join(__dirname, 'buildV1')));
app.use(express.static(path.join(__dirname, 'build')));

router.get('/v1', function (req, res) {
  res.sendFile(path.join(__dirname, 'buildV1', 'index.html'));
});

app.use(router)

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(5000);