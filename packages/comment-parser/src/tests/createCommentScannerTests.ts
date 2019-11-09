import { expect } from "chai";
import { ts } from "@ts-morph/common";
import { createCommentScanner, CommentScanner } from "../createCommentScanner";

describe(nameof(createCommentScanner), () => {
    it("should cache scanned nodes", () => {
        const sourceFile = createFile(`// 1`);
        const scanner = createCommentScanner(sourceFile)
        const firstScan = Array.from(scanner.scanUntilToken());
        scanner.setPos(0);
        const secondScan = Array.from(scanner.scanUntilToken());
        expect(firstScan).to.deep.equal(secondScan);
    });

    describe(nameof<CommentScanner>(s => s.scanForNewLines), () => {
        it("should parse the comments on each line", () => {
            const sourceFile = createFile(`// 1
/* 2 */ /* 3 */    // 4
/* 5 */`);
            const scanner = createCommentScanner(sourceFile);
            checkScanResult(scanner, ["// 1"]);
            checkScanResult(scanner, ["/* 2 */", "/* 3 */", "// 4"]);
            checkScanResult(scanner, ["/* 5 */"]);
            checkScanResult(scanner, []);
        });

        it("should parse up to the first token", () => {
            const sourceFile = createFile(`/* 1 */ test;`);
            const scanner = createCommentScanner(sourceFile);
            checkScanResult(scanner, ["/* 1 */"]);
            checkScanResult(scanner, []);
        });

        it("should parse after the token", () => {
            const sourceFile = createFile(`test; // 1\n   /*2*/ //3`);
            const scanner = createCommentScanner(sourceFile);
            scanner.setPos(sourceFile.statements[0].end);
            checkScanResult(scanner, ["// 1"]);
            checkScanResult(scanner, ["/*2*/", "//3"]);
            checkScanResult(scanner, []);
        });

        it("should ignore blank lines", () => {
            const sourceFile = createFile(`\n  \n // 1\n \n  /*2*/ //3`);
            const scanner = createCommentScanner(sourceFile);
            checkScanResult(scanner, ["// 1"]);
            checkScanResult(scanner, ["/*2*/", "//3"]);
            checkScanResult(scanner, []);
        });

        function checkScanResult(scanner: CommentScanner, expectedTexts: string[]) {
            expect(Array.from(scanner.scanForNewLines()).map(n => n.getText())).to.deep.equal(expectedTexts);
        }
    });

    describe(nameof<CommentScanner>(s => s.scanUntilToken), () => {
        it("should parse until hitting the token", () => {
            const sourceFile = createFile(`// 1
/* 2 */ /* 3 */    // 4
/* 5 */c/*6*/ // 7`);
            const scanner = createCommentScanner(sourceFile);
            checkScanResult(scanner, ["// 1", "/* 2 */", "/* 3 */", "// 4", "/* 5 */"]);
            checkScanResult(scanner, []);
        });

        function checkScanResult(scanner: CommentScanner, expectedTexts: string[]) {
            expect(Array.from(scanner.scanUntilToken()).map(n => n.getText())).to.deep.equal(expectedTexts);
        }
    });

    describe(nameof<CommentScanner>(s => s.scanUntilNewLineOrToken), () => {
        it("should parse until hitting a newline", () => {
            const sourceFile = createFile(`// 1
/* 2 */ /* 3 */    // 4
/* 5 */c//5`);
            const scanner = createCommentScanner(sourceFile);
            checkScanResult(scanner, ["// 1"]);
            checkScanResult(scanner, ["/* 2 */", "/* 3 */", "// 4"]);
            checkScanResult(scanner, ["/* 5 */"]);
            checkScanResult(scanner, []);
            expect(scanner.getPos()).to.equal(sourceFile.statements[0].getStart(sourceFile));
            scanner.setPos(sourceFile.statements[0].end);
            checkScanResult(scanner, ["//5"]);
            checkScanResult(scanner, []);
        });

        function checkScanResult(scanner: CommentScanner, expectedTexts: string[]) {
            expect(Array.from(scanner.scanUntilNewLineOrToken()).map(n => n.getText())).to.deep.equal(expectedTexts);
        }
    });

    function createFile(text: string) {
        return ts.createSourceFile("./test.ts", text, ts.ScriptTarget.Latest);
    }
});