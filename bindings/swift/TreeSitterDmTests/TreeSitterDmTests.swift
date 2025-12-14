import XCTest
import SwiftTreeSitter
import TreeSitterDm

final class TreeSitterDmTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_dm())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading DreamMaker grammar")
    }
}
