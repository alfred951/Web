var file_system = require('fs');
var model = require('../model/queries');
var writter = require('./nfs_checker');
const NodeCache = require( "node-cache" );
const FileCache = new NodeCache( { stdTTL: 360, checkperiod: 120 } );

//BEGIN GENERIC FUNCTIONS
function get_json(user, msg){
    return { user:user, search:{}, msg:msg };
}

function err_fun(req, res){
    var user = req.cookies.user;
    return function(err, result){
        if (err) res.render('logged', get_json(user, err));
    }
}

function msg_fun(req, res, msg){
    var user = req.cookies.user;
    return function(err, result){
        if (err) res.render('logged', get_json(user, err));
        else res.render('logged', get_json(user, msg));
    }
}
//END GENERIC FUNCTIONS

//BEGIN IMAGE CREATION
exports.create_image = function(req, res){
    var user = req.cookies.user;
    var file = req.files.img_file;

    var img_scope = "true";
    if (req.body.img_private != "on") img_scope = "false";

    var img_info = { file: user+"_"+file.name,
                     name: req.body.img_name,
                     path: '/share/fserver'+getRandom(1,4),
                     scope: img_scope };

    img_path = "tmp/"+img_info.file;

    FileCache.set(img_info.file, file);

    return function(err, result){
        if (err) return res.render('logged', get_json(user, err));
        if (result.length != 0) return res.render('logged', get_json(user, "image already exists"));

        model.create_image(img_info, create_image_helper(req, res));
        file.mv(img_path, err_fun(req, res));
        callback = { good: msg_fun(req, res, "image created"),
                     bad: msg_fun(req, res, "ERROR creating the image") };
        writter.move(img_path, img_info.path, callback);
    }
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function create_image_helper(req, res){
    return function(err, result){
        if (err) return res.render('logged', get_json(user, err));

        var img_info = { user: req.cookies.user,
                         img: result.insertId,
                         scope: "true" };

        model.create_image_association(img_info, err_fun(req, res));
    }
}
//END IMAGE CREATION

//BEGIN IMAGE SHARING
exports.share_image = function(req, res){
    var user = req.cookies.user;
    var image = req.body.img_name_share;

    return function(err, result){
        if (err) return res.render('logged', get_json(user, err));
        if (result.length == 0) return res.render('logged', get_json(user, "Bad user"));

        model.search_user_image(user, image, share_image_helper(req, res));
    }
}

function share_image_helper(req, res){
    var user = req.cookies.user;

    return function(err, result){
        if (err) return res.render('logged', get_json(user, err));
        if (result.length == 0) return res.render('logged', get_json(user, "Bad image"));

        var img_info = { user: req.body.img_user_share,
                         img: result[0].imageid,
                         scope: "false" };

        if (req.body.share != undefined) model.create_image_association(img_info, msg_fun(req, res, "Image shared"));
        else model.delete_image_association(img_info, msg_fun(req, res, "Image unshared"));
    }
}
//END IMAGE SHARING

//BEGIN IMAGE UPDATE
exports.update_image = function(req, res){
    var user = req.cookies.user;

    var img_scope;
    if (req.body.img_private2 == "on") img_scope = "true";
    else if (req.body.img_public2 == "on") img_scope = "false";

    return function(err, result){
        if (err) return res.render('logged', get_json(user, err));
        if (result.length == 0) return res.render('logged', get_json(user, "Bad image"));

        var img_info = { id: result[0].imageid,
                         name: req.body.img_name,
                         new_name: req.body.img_new_name,
                         scope: img_scope };

        model.update_image(img_info, msg_fun(req, res, "Image updated"));
    }
}
//END IMAGE UPDATE

//BEGIN IMAGE DELETE
exports.delete_image = function(req, res){
    var user = req.cookies.user;

    return function(err, result){
        if (err) return res.render('logged', get_json(user, err));
        if (result.length == 0) return res.render('logged', get_json(user, "Bad image"));

        var img_info = { user: user,
                         img: result[0].imageid,
                         path: result[0].path,
                         file: result[0].file,
                         owner: result[0].owner };

        if (img_info.owner == "true") model.delete_all_image_associations(img_info.img, delete_image_helper(req, res, img_info));
        else model.delete_image_association(img_info, msg_fun(req, res, "Image deleted"));
    }
}

function delete_image_helper(req, res, info){
    return function(err, result){
        if (err) return res.render('logged', get_json(info.user, err));

        FileCache.del(info.file);

        model.delete_image(info.img, err_fun(req, res));
        callback = { good: msg_fun(req, res, "image deleted"),
                     bad: msg_fun(req, res, "ERROR deleting the image") };
        writter.remove(info.path, info.file, callback);
    }
}
//END IMAGE DELETE

//BEGIN IMAGE SEARCH
exports.search_images_by_name = function(req, res){
    var user = req.cookies.user;

    return function(err, result){
        if (err) res.render('logged', get_json(user, err));
        else if (result.length == 0) res.render('logged', get_json(user, "Bad image"));
        else if (FileCache.get(result[0].file) == undefined) res.render('logged', { user:user, search:result, msg:"" } );
        else res.render('logged', { user:user, search:result, msg:"" } );
    }
}

exports.search_images_by_type = function(req, res){
    var user = req.cookies.user;

    return function(err, result){
        if (err) res.render('logged', get_json(user, err));
        else if (FileCache.get(result[0].file) == undefined) res.render('logged', { user:user, search:result, msg:"" } );
        else res.render('logged', { user:user, search:result, msg:"" } );
    }
}
//END IMAGE SEARCH
