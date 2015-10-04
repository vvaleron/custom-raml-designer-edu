#!/usr/bin/env node

var path = require('path'),
    join = path.join,
    express = require('express'),
    open = require('open'),
    fs = require('fs'),
    bodyParser = require('body-parser');


var argv = require('yargs')
  .usage('Usage: $0 -p [num]')
  .option('p', {
    alias: 'port',
    default: 3000,
    describe: 'Port number to run the API designer',
    type: 'number'
  })
  .argv;

var app = express();
app.use(express.static(join(__dirname, '../dist')));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/ramlFiles', function(req, res){
    var structure = {
        path: '/root',
        name: 'root',
        type: 'folder',
        children: [],
        onlyFiles: []
        };

    var ramlPath = join(__dirname, '../mock_raml');

    function Children(parentPath, childPath, content) {
        var directoryName = parentPath.split(ramlPath).pop().slice(1),
            childFileName = childPath.split(parentPath).pop().slice(1);

        this.name = childFileName;
        this.type = fs.statSync(childPath).isDirectory() ? 'folder' : 'file';
        this.meta = {
              created: new Date()
          };
        this.path = join(structure.path,directoryName ? directoryName : '', childFileName);

        if (content) {
          this.content = content;
        }

        if (this.type === 'folder') {
            this.children = [];
        }
        //console.log('this = ', this);
    }

    function getDirectories(dirPath) {

        fs.readdirSync(dirPath).forEach(function (file) {
             if (fs.statSync(dirPath+'/'+file).isDirectory()) {
                 structure.children.push(new Children(dirPath, dirPath+'/'+file));
             }
        });
    }

    getDirectories(ramlPath);

    function getFiles(callback) {
        structure.children.forEach(function (child) {
            var ramlFilePath = join(ramlPath, child.name,'mock_raml-' + child.name + '.raml'),
                data = fs.readFileSync(ramlFilePath, 'utf8'),
                file = new Children(join(ramlPath, child.name), ramlFilePath, data);
                structure.onlyFiles.push(file);

            child.children.push(file);
        });

        callback();
    }

    getFiles(function() {
        res.send(structure);
    });

});

app.post('/saveRamlFile', function(req, res) {
  var rootName = '/root',
      body = req.body,
      filePath = join(join(__dirname, '../mock_raml'), body.path.split('/root').pop().slice(1)),
      fileContent = body.content;

  res.send('/saveRamlFile');
});

app.listen(argv.p, function () {
  console.log('API designer running on port ' + argv.p + '...')

  open('http://localhost:' + argv.p)
});

