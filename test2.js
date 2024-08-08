const express = require('express')
var cors = require('cors');
const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test2'
});


const app = express()
app.use(cors());
app.use(express.json())


app.post('/users', function (req, res,) {
    const allowedPrefixes = ['Mr', 'Ms', 'Mrs'];
    // Validate the prefix
    if (!allowedPrefixes.includes(req.body.prefix)) {
        return res.status(400).json({ error: 'Invalid prefix. Allowed values are Mr, Ms, Mrs.' });
    }
    let bday = new Date(req.body.bday);
    // Convert the Date object to a MySQL DATE string (YYYY-MM-DD)
    let formattedBday = bday.toISOString().split('T')[0];

    let age = new Date().getFullYear() - bday.getFullYear();
    connection.query(
      'INSERT INTO `users`(`prefix`,`fname`, `lname`, `bday`, `avatar`) VALUES (?, ?, ?, ?, ?)',
      [req.body.prefix , req.body.fname, req.body.lname , formattedBday , req.body.avatar],
      function (err, result) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ result, age });
      }
    );
  })




app.put('/users', function (req, res, next) {
    const allowedPrefixes = ['Mr', 'Ms', 'Mrs'];
    // Validate the prefix
    if (!allowedPrefixes.includes(req.body.prefix)) {
        return res.status(400).json({ error: 'Invalid prefix. Allowed values are Mr, Ms, Mrs.' });
    }
    let bday = new Date(req.body.bday);
    // Convert the Date object to a MySQL DATE string (YYYY-MM-DD)
    let formattedBday = bday.toISOString().split('T')[0];
    let age = new Date().getFullYear() - bday.getFullYear();
    connection.query(
        'UPDATE `users` SET `prefix`=?,`fname`=?, `lname`=?, `bday`= ?, `avatar`=? WHERE id = ?',
        [req.body.prefix, req.body.fname, req.body.lname,  formattedBday, req.body.avatar, req.body.id],
        function (err, result) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ result, age });
    }
  );
})



app.delete('/users', function (req, res, next) {
  connection.query(
    'DELETE FROM `users` WHERE id = ?',
    [req.body.id],
    function (err, result) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    }
  );
})


app.get('/users', function (req, res) {
    connection.query(
        'SELECT * FROM users', 
        function (err, result) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            function calculateAge(birthDate) {
                let bday = new Date(birthDate);
                let age = new Date().getFullYear() - bday.getFullYear();
                return age;
            }

            const usersWithAge = result.map(user => ({
                ...user,
                age: calculateAge(user.bday)
            }));


            
            usersWithAge.sort((a, b) => b.age - a.age);

            res.json(usersWithAge);
        }
    );
});



app.listen(3000, function () {
    console.log('CORS-enabled web server listening on port 3000');
  });