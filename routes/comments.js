var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = require("../middleware");

// ==============
// COMMENT ROUTES
// ==============

// Comments New
router.get("/new", middlewareObj.isLoggedIn, function(req, res) {
    // Find the campground
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
    
});

// Comments Create
router.post("/", middlewareObj.isLoggedIn, function(req, res) {
    // Lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // Create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    // Add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // Save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    // Redirect to campground show page
                    req.flash("sucess", "Successfully added comment")
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// EDIT - comment edit route
router.get("/:comment_id/edit", middlewareObj.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err || !foundComment) {
            req.flash("error", "Comment not found");
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

// UPDATE - comment edit
router.put("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// DESTROY - comment delete
router.delete("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res) {
    // Find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("success", "Comment deleted.")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;
