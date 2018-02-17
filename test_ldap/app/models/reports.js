module.exports = function (mongoose){
var ReportSchema = new mongoose.Schema({
  value: String,
  DeviceAndTime: String,
  description: String,
  firewall: String,
  alerttype: String,
  syslogid: String,
  reason: String,
  from: String,
  to: String,
  flag: String,
  AdditionalDetails: String,
  reamrks: String,
  remarks: String
});
}
