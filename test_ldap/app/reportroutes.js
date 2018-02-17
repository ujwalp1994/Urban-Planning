
 module.exports = function(app) {
var mono = require('mongodb');
var config = require('../config');
var dateform = require('dateformat');
var mongoclient = new mono.Server("localhost", 27017,  {safe:false}, {native_parser: true},{auto_reconnect: true});
var db = new mono.Db('test',mongoclient);
db.open(function(){});
var remarks_logs;

app.post('/api/reports',function(req,res,$filter){
      console.log("in post");
      console.log(req.body.selected_group);
      console.log(req.body.text);
      console.log(req.body.value);
      console.log(req.body.startDate);
      console.log(req.body.endDate);
      console.log(req.body.selected_items);
      var select=[];
      var group=[];
      var start=dateform(req.body.startDate, "yyyy-mm-dd") +" 00:00:00";
      var end=dateform(req.body.endDate, "yyyy-mm-dd") + " 23:59:59";
      console.log(start);
      var first = req.body.selected_group[0].name;
      console.log(first);
      select = req.body.selected_items.split(',');
      group=  req.body.selected_group.split(',');
            console.log(select);

                  var query= { "timestp" : {'$gte' : start, '$lte' : end  },logeventid : { $in: select },'mongo.grpname' : { $in: group }};
                        var collection = db.collection('cdc_processed');
                              collection.find(query).sort({'mongo.host': 1 ,'timestp': 1 }).toArray(function(err, doc) {
                                    if(doc != null) console.log("Doc from Each ");
                                          if(err){ console.log("Error"+err);}
                                                                  res.json(doc);
								  remarks_logs=doc;
                                   }); 
                     });

 app.post('/api/remarks',function(req,res,$filter){
        var ObjectID = require('mongodb').ObjectID;
        
        var angular_array = [];
        console.log(req.body.remark);
        console.log(req.body.id);
	console.log(remarks_logs);
        var first = JSON.stringify(req.body.id);
	var interid = first.split(",");
	console.log(interid);
	for (var i = 0; i < interid.length; i++) {
	 var interid_final = interid[i].toString();
	 var test = interid_final.split(":");
	 console.log(test[1]);
	 var test_1 = test[1].replace("}","");
	 console.log(test_1);
	if(test_1 == "true")
	{
	console.log(test[0]);
	var test_2 = test[0].replace(/{|\"+/g,'');
	console.log(test_2+ "test2");
	var id = mono.ObjectID(test_2);
	console.log(id +"id");
	angular_array.push(id);
	console.log(angular_array);
	console.log(remarks_logs.length);
	//for (var i = 0; i < angular_array.length; i++) {
	for (var j = 0; j < remarks_logs.length; j++) {
	console.log(remarks_logs[j]._id);
	console.log(id);
	if(id==remarks_logs[j]._id.toString())
	{
	remarks_id=id;
	newid = new ObjectID(remarks_id);
	console.log(newid + "here");

        //remarks_id = new ObjectID(id);
	remarks_timestp=remarks_logs[j].timestp.toString();
	console.log(remarks_timestp);
	remarks_eventid=remarks_logs[j].logeventid.toString();
	console.log(remarks_eventid);
          var collection=db.collection('cdc_processed');
        //collection.findAndModify({ "_id" : id},[],{$set: {remarks:req.body.remark}},{new : true}, function(err, result) {
      //collection.findAndModify({query:{_id:id,"logeventid":remarks_eventid,"timestp":remarks_timestp},update:{$set : {"remarks":req.body.remark}},     new:true }, function(err, result) {
        //db.runCommand( { findAndModify: "cdc_processed", query: { "_id":id,"logeventid":remarks_eventid,"timestp":remarks_timestp }, update: {$set : {"remarks":req.body.remark}},new:true } ,function(err, result) {
       
    //     collection.findAndModify({query:{_id:id,"logeventid":remarks_eventid,"timestp":remarks_timestp}},{update:{$set : {"remarks":req.body.remark}}},function(err, result) {
     collection.update( {"_id":id,"logeventid":remarks_eventid,"timestp":remarks_timestp },    { $set: { "remarks": req.body.remark }} ,function(err, result) {
        console.log(err);
        console.log('updated doc:' + result);
        });
	break;
	}

	}
	/*var collection = db.collection('cdc_processed');
	collection.findAndModify({ "_id" : id},[],{$set: {remarks:req.body.remark}},{new : true}, function(err, result) {
	console.log(err);
	console.log('updated doc:' + result);
 	});*/
 	}
 	}



        
	res.send(angular_array);
	});

app.post('/api/onehost',function(req,res,$filter){
	console.log(req.body.hostname);
	var host = req.body.hostname;
	var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
	var collection = db.collection('cdc_processed');
        var group=[];
        var chart=[];
        var i=0;
        var j=0;
        group= req.body.selected_groups.split(',');
        collection.aggregate( [{$match: {$and: [ {"mongo.host": host}, {timestp:{ $gt : start, $lte : end } }]}},{ $group: { _id: "$logeventid", total: { $sum: 1 } } } ], function(err, doc) {  
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
          //res.json(doc);
        });
        });
////////////////////////////////////////////////
app.post('/api/alerts',function(req,res,$filter){
        
      console.log(req.body.startDate);
      console.log(req.body.endDate);
      console.log(req.body.selected_alerts);
      var select=[];
     var collection = db.collection('cdc_alerts_new'); 
      var start=dateform(req.body.startDate, "yyyy-mm-dd") +" 00:00:00";
      var end=dateform(req.body.endDate, "yyyy-mm-dd") + " 23:59:59";
      console.log(start);
      
//      console.log(first);
      select = req.body.selected_alerts.split(',');
   
            console.log(select);

        collection.aggregate( [{$match: {$and: [ {"eventid_security":{ $in: select } }, {"alert_date":{ $gte :start , $lte : end } }]}},{ $group: { _id: "$host",eventid: { $first: '$eventid_security' }, reason:{$first:'$reason'},total: { $sum: 1 } } },    {$sort:{"total":-1}} ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
  
        console.log(doc);}
        
        if(err){ console.log("Error"+err);}
         res.json(doc);
        });
        });

app.post('/api/hosts_table_alerts',function(req,res,$filter){
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_alerts_new');
        var chart=[];
        console.log(start); 
        var i=0;
        var j=0;
        collection.aggregate( [ { $match :  {$and: [  {"alert_date":{ $gt : start, $lte : end } }]}},{ $group: { _id: {hostname:"$host"}, total: { $sum: 1 } } }, {$sort:{total:-1}} ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");

        for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i]._id.hostname,doc[i].total];
        }
        //console.log(chart);
        }
        res.json(doc);
        if(err){ console.log("Error"+err);}
        });
        });

       app.post('/api/events_table_alerts',function(req,res,$filter){
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_alerts_new');
        var chart=[];
        
        var i=0;
        var j=0;
     
         console.log(start);
        console.log(end);
        collection.aggregate( [ { $match :  {$and: [  {"alert_date":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$eventid_security", total: { $sum: 1 } }}, {$sort:{total:-1} } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i]._id,doc[i].total];
        }
        console.log(chart);}
        res.json(doc);
        if(err){ console.log("Error"+err);}
        });
        });

	app.post('/api/events_charts_alerts',function(req,res,$filter){
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_alerts_new');
        var chart=[];

        var i=0;
        var j=0;

         console.log(start);
        console.log(end);
        collection.aggregate( [ { $match :  {$and: [  {"alert_date":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$eventid_security", total: { $sum: 1 } }}, {$sort:{total:-1} } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i]._id,doc[i].total];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });

	app.post('/api/hosts_charts_alerts',function(req,res,$filter){
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_alerts_new');
        var chart=[];

        var i=0;
        var j=0;

         console.log(start);
        console.log(end);
        collection.aggregate( [ { $match :  {$and: [  {"alert_date":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$host", total: { $sum: 1 } }}, {$sort:{total:-1} } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i]._id,doc[i].total];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });

	app.post('/api/oneeventalerts',function(req,res,$filter){
        console.log(req.body.eventid);
        var eventid = req.body.eventid;
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_alerts_new');
        var chart=[];
        var i=0;
        var j=0;
    collection.aggregate( [{$match: {$and: [ {"eventid_security": eventid}, {"alert_date":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$host", total: { $sum: 1 } } } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });

	app.post('/api/onehostalerts',function(req,res,$filter){
        console.log(req.body.hostname);
        var hosts = req.body.hostname;
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_alerts_new');
        var chart=[];
        var i=0;
        var j=0;
    collection.aggregate( [{$match: {$and: [ {"host": hosts}, {"alert_date":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$eventid_security", total: { $sum: 1 } } } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });

	app.post('/api/oneipalerts',function(req,res,$filter){
        console.log(req.body.hostname);
        var hosts = req.body.hostname;
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_alerts_new');
        var chart=[];
        var i=0;
        var j=0;
    collection.aggregate( [{$match: {$and: [ {"host": hosts}, {"alert_date":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$eventid_security", total: { $sum: 1 } } } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });
///////////////////////////////////////////
app.post('/api/oneip',function(req,res,$filter){
        console.log(req.body.hostname);
        var host = req.body.hostname;
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
	var collection = db.collection('cdc_processed');
        var chart=[];
        var i=0;
        var j=0;
    collection.aggregate( [{$match: {$and: [ {"mongo.ip": host}, {timestp:{ $gt : start, $lte : end } }]}},{ $group: { _id:"$logeventid", total: { $sum: 1 } } } ], function(err, doc) {
   //     collection.aggregate( [ { $match: { "mongo.ip": host } }, { $group: { _id: "$logeventid", total: { $sum: 1 } } } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
  //      console.log(doc);
        for(i=0;i<doc.length;i++)
        {
	if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });

app.post('/api/oneevent',function(req,res,$filter){
        console.log(req.body.eventid);
        var eventid = req.body.eventid;
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_processed');
        var chart=[];
        var i=0;
        var j=0;
    collection.aggregate( [{$match: {$and: [ {"logeventid": eventid}, {timestp:{ $gt : start, $lte : end } }]}},{ $group: { _id: "$mongo.host", total: { $sum: 1 } } } ], function(err, doc) {
	if(doc.length >0) {console.log("Doc from Eachs ");
	for(i=0;i<doc.length;i++)
        {
	if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });


app.post('/api/charts_reg',function(req,res,$filter){
        console.log(req.body.selected_categories);
	var start=req.body.state_type;
        var end=req.body.type_of_data;
	var collection = db.collection('action');
	var chart=[];
        var group=[];
        var i=0;
        var j=0;

	if(req.body.type_of_data=="Case Wise Visualization of Data")
	{
	
        category= req.body.selected_categories.split(',');
	collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$cases_reg" } } } ], function(err, doc) {
  	console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
	for(i=0;i<doc.length;i++)
    	{
	if(doc[i]._id != null)
	chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
	}
	console.log(chart);}
	res.json(chart);
	if(err){ console.log("Error"+err);}
	});
}
	if(req.body.type_of_data=="Person Wise Visualization of Data")
        {

        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$person_arrest" } } } ], function(err, doc) {

	console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
	for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
}
	});

	
	app.post('/api/charts_charge',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var end=req.body.type_of_data;
        var collection = db.collection('action');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;

        if(req.body.type_of_data=="Case Wise Visualization of Data")
        {

        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$cases_charge" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
}
        if(req.body.type_of_data=="Person Wise Visualization of Data")
        {

	console.log(req.body.sub_category);
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$person_charge" } } } ], function(err, doc) {

        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
}


        });


	app.post('/api/charts_convi',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var end=req.body.type_of_data;
        var collection = db.collection('action');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;

        if(req.body.type_of_data=="Case Wise Visualization of Data")
        {

        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$cases_convi" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
}
        if(req.body.type_of_data=="Person Wise Visualization of Data")
        {

        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$person_convi" } } } ], function(err, doc) {

        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
}


        });

	app.post('/api/charts_search',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var end=req.body.type_of_data;
        var collection = db.collection('action');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
	var input_category=req.body.category.toUpperCase();
	console.log(input_category);
        if(req.body.type_of_data=="Case Wise Visualization of Data")
        {

        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"categories":input_category}]}},{ $group: { _id: "$year", total: { $sum: "$cases_convi" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
	var test="year_"+doc[i]._id;
        chart[i]=[test,doc[i].total,test];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
}
        if(req.body.type_of_data=="Person Wise Visualization of Data")
        {
	//var input_category=req.body.category.toUpperCase();
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"categories":input_category}]}},{ $group: { _id: "$year", total: { $sum: "$person_convi" } } } ], function(err, doc) {

        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
	var test="year_"+doc[i]._id;
        chart[i]=[test,doc[i].total,test];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
}
	});

	app.post('/api/punishment_firstyear',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('punishment');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
	if(req.body.sub_category != "COMPUTER"){
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2011" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
	}

	if(req.body.sub_category == "COMPUTER"){
	current_year="2011";
	console.log("in computer");
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"year":"2011"}]}},{ $group: { _id: "$categories", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

	});

	app.post('/api/punishment_secondyear',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('punishment');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        if(req.body.sub_category != "COMPUTER"){
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2012" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        if(req.body.sub_category == "COMPUTER"){
        current_year="2012";
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"year":current_year}]}},{ $group: { _id: "$categories", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        });

	app.post('/api/punishment_thirdyear',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('punishment');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        if(req.body.sub_category != "COMPUTER"){
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2013" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        if(req.body.sub_category == "COMPUTER"){
        current_year="2013";
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"year":current_year}]}},{ $group: { _id: "$categories", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        });

	app.post('/api/punishment_search',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('punishment');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        if(req.body.sub_category != "COMPUTER"){
        category= req.body.selected_categories.split(',');
        console.log(req.body.input_text);
        if(req.body.input_text=="2011")
        {
        console.log("in 2011");
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2011" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
	chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        if(req.body.input_text=="2012")
        {
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2012" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
	console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        if(req.body.input_text=="2013")
        {
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2013" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
	if(err){ console.log("Error"+err);}
        });
        }
        }

        if(req.body.sub_category == "COMPUTER"){
        current_year="2012";
        category= req.body.selected_categories.split(',');
	console.log(req.body.input_text);
        collection.aggregate( [  { $match : {$and: [ {"categories":req.body.input_text }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$year", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        var test="year_"+doc[i]._id
        chart[i]=[test,doc[i].total,test];
        }
        console.log(chart);}
	res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }
        });


	app.post('/api/crime_firstyear',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('crime');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        if(req.body.sub_category != "COMPUTER" && req.body.sub_category != "IT ACT"){
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2011" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        if(req.body.sub_category == "COMPUTER" || req.body.sub_category == "IT ACT"){
        current_year="2011";
        category= req.body.selected_categories.split(',');
	console.log(category);
	console.log(req.body.sub_category);
	collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"year":"2011"}]}},{ $group: { _id: "$categories", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        });

	app.post('/api/crime_secondyear',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('crime');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        if(req.body.sub_category != "COMPUTER" && req.body.sub_category != "IT ACT"){
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2012" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }
	if(req.body.sub_category == "COMPUTER" || req.body.sub_category == "IT ACT"){
        current_year="2012";
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"year":"2012"}]}},{ $group: { _id: "$categories", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        });

	app.post('/api/crime_thirdyear',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('crime');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        if(req.body.sub_category != "COMPUTER" && req.body.sub_category != "IT ACT"){
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2013" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }
	if(req.body.sub_category == "COMPUTER" || req.body.sub_category == "IT ACT"){
        current_year="2013";
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category },{"year":"2013"}]}},{ $group: { _id: "$categories", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

        });

	app.post('/api/crime_search',function(req,res,$filter){
        console.log(req.body.selected_categories);
        var start=req.body.state_type;
        var collection = db.collection('crime');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        if(req.body.sub_category != "COMPUTER" && req.body.sub_category != "IT ACT"){
        category= req.body.selected_categories.split(',');
	console.log(req.body.input_text);
	if(req.body.input_text=="2011")
	{
	console.log("in 2011");
	collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2011" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
	if(err){ console.log("Error"+err);}
        });
	}

	if(req.body.input_text=="2012")
        {
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2012" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

	if(req.body.input_text=="2013")
        {
        collection.aggregate( [  { $match : {$and: [ {"categories":{ $in: category } }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$categories", total: { $sum: "$year_2013" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }

	}	

        if(req.body.sub_category == "COMPUTER"){
        current_year="2012";
        category= req.body.selected_categories.split(',');
        collection.aggregate( [  { $match : {$and: [ {"categories":req.body.input_text }, {"states":req.body.state_type },{"sub_category":req.body.sub_category }]}},{ $group: { _id: "$year", total: { $sum: "$total" } } } ], function(err, doc) {
        console.log(doc.length);
        if(doc.length >0) {console.log("Doc from Eachs ");
        for(i=0;i<doc.length;i++)
        {
        if(doc[i]._id != null)
	var test="year_"+doc[i]._id
        chart[i]=[test,doc[i].total,test];
        }
        console.log(chart);}
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        }
	});

app.post('/api/hosts',function(req,res,$filter){
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
	var collection = db.collection('cdc_processed');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        group= req.body.selected_groups.split(',');
         console.log("groupppppp");
         console.log(group);
        collection.aggregate( [ { $match : {$and: [ {"mongo.grpname":{ $in: group } }, {"timestp":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$mongo.host", total: { $sum: 1 } } }, {$sort:{total:-1}} ], function(err, doc) {
        if(doc.length >0 && doc.length>20) {console.log("Doc from Eachs ");
  //      console.log(doc);
        for(i=0;i<20;i++)
        {
	if(doc[i]._id != null)
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
	}
        console.log(chart);}
	if(doc.length >0 && doc.length<20) {console.log("Doc from Eachs ");
	for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i]._id,doc[i].total,doc[i]._id];
        }
        console.log(chart);}
	chart[i+1]=[doc.length]
        res.json(chart);
        if(err){ console.log("Error"+err);}
        });
        });

app.post('/api/hosts_table',function(req,res,$filter){
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
	var collection = db.collection('cdc_processed');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        group= req.body.selected_groups.split(',');
        collection.aggregate( [ { $match :  {$and: [ {"mongo.grpname":{ $in: group } }, {"timestp":{ $gt : start, $lte : end } }]}},{ $group: { _id: {hostname:"$mongo.host", ip:"$mongo.ip",group:"$mongo.grpname"}, total: { $sum: 1 } } }, {$sort:{total:-1}} ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
        
        for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i]._id.hostname,doc[i]._id.ip,doc[i].total,doc[i].grpname];
        }
        console.log(chart);}
        res.json(doc);
        if(err){ console.log("Error"+err);}
        });
        });


	app.post('/api/events_table',function(req,res,$filter){
        var start=dateform(req.body.startDate, "yyyy-mm-dd");
        var end=dateform(req.body.endDate, "yyyy-mm-dd");
        var collection = db.collection('cdc_processed');
        var chart=[];
        var group=[];
        var i=0;
        var j=0;
        group= req.body.selected_groups.split(',');
         console.log(start);
        console.log(end);
        collection.aggregate( [ { $match :  {$and: [ {"mongo.grpname":{ $in: group } }, {"timestp":{ $gt : start, $lte : end } }]}},{ $group: { _id: "$logeventid", total: { $sum: 1 } }}, {$sort:{total:-1} } ], function(err, doc) {
        if(doc.length >0) {console.log("Doc from Eachs ");
	for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i]._id,doc[i].total];
        }
        console.log(chart);}
        res.json(doc);
        if(err){ console.log("Error"+err);}
        });
        });

app.post('/api/statestype',function(req,res,$filter){
	//var collection = db.collection('crime');
	
	console.log(req.body.main_type_Select);
	if(req.body.main_type_Select=="Action"){
        var collection = db.collection('action');
        }

        if(req.body.main_type_Select=="Crime"){
        var collection = db.collection('crime');
        }

        if(req.body.main_type_Select=="Punishment"){
        var collection = db.collection('punishment');
	console.log("in punishment");
        }
	var chart=[];
	collection.distinct( "states",{ "states": { $not: /&/ } } , function(err, doc) {
	//collection.aggregate( [ { $group: { _id: { id:"$mongo.grpname", name:"$mongo.grpname"} } } ], function(err, doc) {
	console.log(doc);
	for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i].name];
        }
	res.json(doc);
	if(err){ console.log("Error"+err);}
        });
	});

app.post('/api/categories',function(req,res,$filter){
	var group = req.body.statetype;
        console.log(group);
	if(req.body.main_type_Select=="Action"){
	var collection = db.collection('action');
	}
	
	if(req.body.main_type_Select=="Crime"){
        var collection = db.collection('crime');
        }

	if(req.body.main_type_Select=="Punishment"){
        var collection = db.collection('punishment');
        }

        var chart=[];
	if (req.body.statetype=="Check All")
	{
	collection.distinct( "categories",{ "categories": { $not: /&/ } } , function(err, doc) {
	console.log(doc);
        for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i].name];
        }
        res.json(doc);
        if(err){ console.log("Error"+err);}
        });
	}
	else
	{
	console.log(collection);
	var sub_category= req.body.sub_category_Select.toUpperCase();
	console.log(sub_category);
        collection.distinct( "categories",{ $and:[ {"sub_category":{$regex: sub_category}},{"states": { $regex: group}}]}, function(err, doc) {
	console.log(doc);
        for(i=0;i<doc.length;i++)
        {
        chart[i]=[doc[i].name];
        }
        res.json(doc);
        if(err){ console.log("Error"+err);}
        });
	}
        });


}
