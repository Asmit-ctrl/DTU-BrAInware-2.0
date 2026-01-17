from manim import *

class SimpleLesson(Scene):
    def construct(self):
        title = Text("Number System", font_size=60, color=YELLOW)
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))
        
        text1 = Text("Natural: 1, 2, 3, 4...", font_size=36, color=BLUE)
        text2 = Text("Whole: 0, 1, 2, 3...", font_size=36, color=GREEN)
        text3 = Text("Integers: ...-2, -1, 0, 1, 2...", font_size=36, color=RED)
        
        texts = VGroup(text1, text2, text3).arrange(DOWN, buff=0.5)
        
        self.play(Write(text1))
        self.wait(1)
        self.play(Write(text2))
        self.wait(1)
        self.play(Write(text3))
        self.wait(2)
        
        end = Text("Great job!", font_size=48, color=GREEN)
        self.play(FadeOut(texts), FadeOut(title))
        self.play(Write(end))
        self.wait(2)
