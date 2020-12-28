ToDo
====

Must have
----
- Implement switching units
- Re-ordering of the layers (preferably drag/drop)
- Save / load designs (clipboard, or preferably file download/upload - maybe Cloud storage integration later?)

Should have
----
- Render width and height of the boards in the previews
- Material usage overview
- Generate cutting list
- Support for fractional inches (see, not all europeans look down on freedom units!)

Nice to have
----
- More advanced options, like custom direction per strip and mixing multiple edge grain boards with different layers for the end grain board (the code is half prepared for this by having the boards array encapsulating the layers, though it's all hardcoded to board[0] now)
- 3D effect for previews emulating thickness / crosscut width
- Make it a tiny bit prettier overall
