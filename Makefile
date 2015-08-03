antlr:
	test build || mkdir -f build
	antlr4 -Dlanguage=JavaScript -o build -visitor asn.g

all: antlr
