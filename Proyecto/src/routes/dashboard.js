const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

//Only Dahsboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
    res.render('dashboard/dashboard');
});

//Dahsboard users

router.get('/dashboard/users', isLoggedIn, async (req, res) => {
    const users = await pool.query('SELECT * FROM user');// It send to the list and create an array with the users
    res.render('dashboard/users/list', { users: users });
});

router.get('/dashboard/users/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM user WHERE ID_U = ?', [id]);
    res.render('./dashboard/users/edit', { user: users[0] });
});

router.post('/dashboard/users/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const editUser = {
        name,
        email,
        role
    };
    await pool.query('UPDATE user set ? WHERE ID_U = ?', [editUser, id]);
    req.flash('success', 'User updated successfully');
    res.redirect('/dashboard/users');
});

router.get('/dashboard/users/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    if (id == req.user.ID_U){
        req.flash('message',"You can't delete yourself!");
        res.redirect('/dashboard/users');
    }else{
        await pool.query('DELETE FROM user WHERE ID_U = ?', [id]);
        req.flash('success', 'User deleted successfully');
        res.redirect('/dashboard/users');
    }
});

router.get('/dashboard/users/add', isLoggedIn, (req, res) => {
    res.render('dashboard/users/add');
});

router.post('/dashboard/users/add', isLoggedIn, async (req, res) => {
    const { name, email, role, password } = req.body;
    const newUser = {
        name,
        email,
        password,
        role
    };
    await pool.query('INSERT INTO user set ?', [newUser]);
    req.flash('success', 'User saved successfully');
    res.redirect('/dashboard/users');
});


// Make a net capture (sniff)

router.get('/dashboard/captures/add', isLoggedIn, (req, res) => {
    // TODO: VIEW OF CAPTURES IN DASHBOARD
    // res.render('dashboard/captures/add');
});

router.post('/dashboard/captures', isLoggedIn, async (req, res) => {
    // execute sniffer python file to generate json
    const {spawn} = require('child_process');
    const childPython = spawn('python3',['../../packet_sniffer/sniffer.py']);
    childPython.stdout.on('data',(data)=>{
        console.log(`stdout: ${data}`);
    });
    childPython.stderr.on('data',(data)=>{
        console.log(`stderr: ${data}`);
    });
    childPython.on('close',(code)=>{
        console.log(`Child process exited with code: ${code}`);
    });

    // wait for file to be generated
    // todo: sleep

    // read json file
    // todo: read json

    //TODO: STRUCTURE AND SAVE CAPTURE

    //await pool.query('INSERT INTO captures set ?', [newUser]);
    //req.flash('success', 'Capture made succesfully!');
    //res.redirect('/dashboard/');
});



module.exports = router;