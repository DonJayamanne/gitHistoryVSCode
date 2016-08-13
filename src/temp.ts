// function Entry(logView, data) {
//         var self = this;

//         self.abbrevCommitHash = function() {
//             return self.commit.substr(0, 7);
//         };

//         self.abbrevMessage = function() {
//             var end = self.message.indexOf("\n");
//             if (end == -1) {
//                 return self.message
//             } else {
//                 return self.message.substr(0, end);
//             }
//         };

//         self.createElement = function() {
//             self.element = $('<a class="log-entry list-group-item">' +
//                                 '<header>' +
//                                     '<h6></h6>' +
//                                     '<span class="log-entry-date">' + self.author.date.toLocaleString() + '&nbsp;</span> ' +
//                                     '<span class="badge">' + self.abbrevCommitHash() + '</span>' +
//                                 '</header>' +
//                                 '<p class="list-group-item-text"></p>' +
//                              '</a>')[0];
//             $('<a target="_blank" href="mailto:' + self.author.email + '">' + self.author.name + '</a>').appendTo($("h6", self.element));
//             $(".list-group-item-text", self.element)[0].appendChild(document.createTextNode(self.abbrevMessage()));
//             if (self.refs) {
//                 var entryName = $("h6", self.element);
//                 self.refs.forEach(function (ref) {
//                     if (ref.indexOf("refs/remotes") == 0) {
//                         ref = ref.substr(13);
//                         var reftype = "danger";
//                     } else if (ref.indexOf("refs/heads") == 0) {
//                         ref = ref.substr(11);
//                         var reftype = "success";
//                     } else if (ref.indexOf("tag: refs/tags") == 0) {
//                         ref = ref.substr(15);
//                         var reftype = "info";
//                     } else {
//                         var reftype = "warning";
//                     }
//                     $('<span>&nbsp;</span><span class="label label-' + reftype + '">' + ref + '</span>').insertAfter(entryName);
//                 });
//             }
//             self.element.model = self;
//             var model = self;
//             $(self.element).click(function (event) {
//                 model.select();
//             });
//             return self.element;
//         };

//         self.select = function() {
//             if (currentSelection != self) {
//                 if (currentSelection) {
//                     $(currentSelection.element).removeClass("active");
//                 }
//                 $(self.element).addClass("active");
//                 currentSelection = self;
//                 logView.historyView.commitView.update(self);
//             }
//         };

//         self.parents = [];
//         self.message = ""

//         data.split("\n").forEach(function(line) {
//             if (line.indexOf("commit ") == 0) {
//                 self.commit = line.substr(7, 40);
//                 if (line.length > 47) {
//                     self.refs = []
//                     var s = line.lastIndexOf("(") + 1;
//                     var e = line.lastIndexOf(")");
//                     line.substr(s, e - s).split(", ").forEach(function(ref) {
//                         self.refs.push(ref);
//                     });
//                 }
//             } else if (line.indexOf("parent ") == 0) {
//                 self.parents.push(line.substr(7));
//             } else if (line.indexOf("tree ") == 0) {
//                 self.tree = line.substr(5);
//             } else if (line.indexOf("author ") == 0) {
//                 self.author = new Person(line.substr(7));
//             } else if (line.indexOf("committer ") == 0) {
//                 self.committer = new Person(line.substr(10));
//             } else if (line.indexOf("    ") == 0) {
//                 self.message += line.substr(4) + "\n";
//             }
//         });

//         self.message = self.message.trim();

//         self.createElement();
//     };