var express = require('express');
var app = express();
var cors = require('cors')
app.set('port', process.argv[2] || 3001);
app.use(cors())
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'secret',
    user            : 'secret',
    password        : 'secret',
    database        : 'secret',
});

module.exports = app;


//citation: the idea to create variables was from Greg Healy
var selectQuery ='SELECT * FROM workouts';
var deleteQuery = 'DELETE FROM workouts WHERE id=?';
var dropTableQuery = "DROP TABLE IF EXISTS workouts";
var createTableQuery = "CREATE TABLE workouts(" +
                        "id INT PRIMARY KEY AUTO_INCREMENT," +
                        "name VARCHAR(255) NOT NULL," +
                        "reps INT," +
                        "weight INT," +
                        "units BOOLEAN," +
                        "date DATE)";

// get all the data from SQL server to pass back
app.get('/', function(req,res,next) {
    pool.query(selectQuery, function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        res.json({rows});
    })
});

//deletes a specified row
app.delete('/', function(req, res,next ) {
    pool.query(deleteQuery, [req.body.id], function (err, rows, result) {
        if (err) {
            next(err);
            return;
        }
        res.json({rows});
    });
});

// updates a specified row
app.put('/', function(req,res,next) {
    pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function (err, rows) {
        if (err) {
            next(err);
            return;
        }
        if (rows.length === 1) {
            // pool.query(updateQuery, [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.id], function (err, result) {
            var curVals = rows[0]
            pool.query('UPDATE workouts SET name=?, reps=?, weight=?, date=?, units=? WHERE id=?',
                [req.body.name || curVals.name, req.body.reps || curVals.reps, req.body.weight || curVals.weight, req.body.date || curVals.date, req.body.units || curVals.units, req.body.id], function (err, result) {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.json({result})
                });
        }
    });
});


//inserts a new row at the end
app.post('/',function(req, res, next) {
    var body = req.body;
    var name = body.name;
    var reps = body.reps;
    var weight = body.weight;
    var date = body.date;
    var units = body.units;
    pool.query("INSERT INTO workouts(name, reps, weight, date, units) VALUES (?, ?, ?, ?, ?)", [name, reps, weight, date, units], function(err, rows, fields){
        if (err) {
            console.log(err);
            return;
        }
        pool.query(selectQuery, function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            res.json({rows});
        })
    });
});


//resets table
app.get('/reset-table', function(req,res,next){
    var context = {};
    pool.query(dropTableQuery, function(err){
        pool.query(createTableQuery, function(err){
            context.results = "Table reset";
        });
    });
});


app.use(function(req, res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.log(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

