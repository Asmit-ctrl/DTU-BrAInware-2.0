
from manim import *

from manim import *

class DoubtAnimation(Scene):
    def construct(self):
        # Scene 1: Title
        title = Text("Six Rational Numbers between 3 and 4", font_size=36, color=YELLOW)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Scene 2: Number line from 3 to 4
        number_line = NumberLine(x_range=[3, 4, 1/7], length=8, include_numbers=True, decimal_number_config={"num_decimal_places": 0})
        self.play(Create(number_line), run_time=2)
        self.wait(1)

        # Mark 3 and 4
        three = Dot(number_line.n2p(3), color=BLUE)
        four = Dot(number_line.n2p(4), color=BLUE)
        self.play(FadeIn(three), FadeIn(four), run_time=1)
        three_label = MathTex("3 = \frac{21}{7}", font_size=30, color=BLUE).next_to(three, DOWN)
        four_label = MathTex("4 = \frac{28}{7}", font_size=30, color=BLUE).next_to(four, DOWN)
        self.play(Write(three_label), Write(four_label), run_time=1)
        self.wait(1)

        # Mark six rational numbers: 22/7, 23/7, 24/7, 25/7, 26/7, 27/7
        rationals = [22/7, 23/7, 24/7, 25/7, 26/7, 27/7]
        labels = ["\\frac{22}{7}", "\\frac{23}{7}", "\\frac{24}{7}", "\\frac{25}{7}", "\\frac{26}{7}", "\\frac{27}{7}"]
        dots = []
        for val, lab in zip(rationals, labels):
            dot = Dot(number_line.n2p(val), color=GREEN)
            label = MathTex(lab, font_size=28, color=GREEN).next_to(dot, UP)
            self.play(FadeIn(dot), Write(label), run_time=0.7)
            dots.append((dot, label))
        self.wait(2)

        # Fade out
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait()

# Render command will be: manim -pql E:\code\OnDemand\server\output\manim\doubt_followup_1768606229666_1768606229666.py DoubtAnimation
