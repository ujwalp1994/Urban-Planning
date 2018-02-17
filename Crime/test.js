db.punishment.find({year: {$exists: true}}).forEach(function(obj) {
    obj.year = "" + obj.year;
    db.punishment.save(obj);
});
