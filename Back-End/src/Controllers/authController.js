router.post('/login', authController.login);
router.post('/newUserTemp', authController.newUserTemp);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.delete('/:id', authController.delete);


function loginAction(req, res) {

}

function registerTempLoginAction(req, res) {
    
}

function registerAction(req, res) {

}

function logoutAction(req, res) {

}

function deleteAction(req, res) {

}

export default {
    loginAction,
    registerTempLoginAction,
    registerAction,
    logoutAction,
    deleteAction
};