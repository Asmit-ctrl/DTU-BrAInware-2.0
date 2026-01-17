
from manim import *

from manim import *

class DoubtAnimation(Scene):
    def construct(self):
        # Title
        title = Text('Proving 0.333... = 1/3', font_size=48, color=BLUE)
        self.play(Write(title))
        self.wait(2)

        # Step 1: Define x
        eq1 = MathTex(r'x = 0.\overline{3}', font_size=48).shift(UP)
        self.play(Write(eq1))
        self.wait(2)

        # Step 2: Multiply by 10
        eq2 = MathTex(r'10x = 3.\overline{3}', font_size=48).next_to(eq1, DOWN, buff=0.5)
        arrow = Arrow(start=eq1.get_bottom(), end=eq2.get_top(), color=YELLOW, buff=0.2)
        self.play(Write(eq2), Write(arrow))
        self.wait(2)

        # Step 3: Subtract
        eq3 = MathTex(r'10x - x = 3.\overline{3} - 0.\overline{3}', font_size=48).next_to(eq2, DOWN, buff=0.5)
        self.play(Write(eq3))
        self.wait(2)

        # Step 4: Simplify
        eq4 = MathTex(r'9x = 3', font_size=48, color=GREEN).next_to(eq3, DOWN, buff=0.5)
        self.play(Transform(eq3.copy(), eq4))
        self.wait(2)

        # Step 5: Solve
        eq5 = MathTex(r'x = \frac{3}{9} = \frac{1}{3}', font_size=48, color=GOLD).next_to(eq4, DOWN, buff=0.5)
        self.play(Transform(eq4.copy(), eq5))
        self.wait(3)

        # Visual: Number line
        line = NumberLine(x_range=[0, 1.2, 0.2], length=8, include_numbers=True).shift(DOWN*1.5)
        dot = Dot(point=line.n2p(1/3), color=RED, radius=0.1)
        label = Text('1/3 ≈ 0.333...', font_size=36, color=RED).next_to(dot, UP)
        self.play(Create(line), FadeIn(dot), Write(label))
        self.wait(3)

        self.play(FadeOut(VGroup(*self.mobjects)))
        self.play(FadeIn(title))
        self.wait(1)

# Render command will be: manim -pql E:\code\OnDemand\server\output\manim\doubt_e1d8cd66-f7b2-4d17-a12a-0b4f85ac71dd_1768610676805_1768610676806.py DoubtAnimation
