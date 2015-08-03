var
  fs = require("fs"),
  path= require("path")

var
  filenames = fs.readdirSync(__dirname),
  files= {}

for(var i in filenames){
	var
	  filename= filenames[i]
	if(filename == "index.js" || /\.swp$/.test(filename))
		continue;
	var
	  lastDot= filename.lastIndexOf(".")
	  shortname= lastDot == -1 ? filename : filename.substring(0, lastDot)
	Object.defineProperty(exports, shortname, {
		enumerable: true,
		get: getter(filename)
	})
}

function getter(filename){
	return function(){
		var file= files[filename]
		if(file)
			return file
		var fullname = __dirname + path.sep + filename
		return files[filename] = fs.readFileSync(fullname, 'utf8')
	}
}


exports.parser= function(inputString){
	var
	  asn= require("../"),
	  antlr4= require("antlr4"),
	  chars= new antlr4.InputStream(inputString),
	  lexer= new asn.AsnLexer(chars),
	  tokens= new antlr4.CommonTokenStream(lexer),
	  parser= new asn.AsnParser(tokens)
	parser.buildParseTree= true
	return parser
}

exports.printVisitorFactory= function(methodFactory){
	methodFactory= methodFactory|| exports.printVisitorMethodFactory
	var
	  asn= require("../"),
	  antlr4= require("antlr4"),
	  visitor= function(){
		antlr4.tree.ParseTreeVisitor.call(this)
		return this
	  }
	for(var i in asn.AsnVisitor.prototype){
		visitor[i]= methodFactory(i)
	}
	return visitor
}

exports.printVisitorMethodFactory= function(name){
	var printerMethod = function(ctx){
		console.log("HAVE", name, ctx)
	}
	printerMethod.name = "print" + name.substring(0,1).toUpperCase() + name.substring(1)
	return printerMethod
}

exports.apply= function(inputString, parser, visitorFactory, rule){
	parser= parser|| exports.parser
	visitorFactory= visitorFactory|| exports.printVisitorFactory
	rule= rule|| "moduleDefinition"
	var
	  antlr4= require("antlr4"),
	  parser= parser(inputString),
	  tree= parser[rule](),
	  visitor= new visitorFactory()
	// not quite
	antlr4.tree.ParseTreeWalker.DEFAULT.walk(visitor, tree)
	return tree
}

var special= ["parser", "printVisitorFactory", "printVisitorMethodFactory", "main"]
exports.main = function(apply){
	apply= apply|| exports.apply
	var
	  antlr4= require("antlr4")
	for(var i in exports){
		if(special.indexOf(i) != -1)
			continue
		var
		  module= exports[i]
		  tree= apply(module)
	}
}

if(require.main === module){
	exports.main()
}
