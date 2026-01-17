from manim import *

class SimpleTest(Scene):
    def construct(self):
        text = Text("Hello Student!", font_size=72, color=BLUE)
        self.play(Write(text))
        self.wait(2)
