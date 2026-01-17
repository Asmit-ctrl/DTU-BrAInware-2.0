
from manim import *

from manim import *

class DoubtAnimation(Scene):
    def construct(self):
        # Title
        title = Text("Find 6 Rational Numbers Between 3 and 4", font_size=36, color=BLUE)
        self.play(Write(title))
        self.wait(2)

        # Number line
        number_line = NumberLine(x_range=[2, 5, 0.2], length=8, stroke_width=3, include_numbers=True)
        self.play(Create(number_line))
        self.wait(1)

        # Mark 3 and 4
        label3 = number_line.numbers[3].copy().set_color(RED).scale(1.5)
        label4 = number_line.numbers[4].copy().set_color(RED).scale(1.5)
        self.play(FadeIn(label3), FadeIn(label4))
        self.wait(1)

        # Text explanation step 1
        step1 = MathTex("3 = \\frac{21}{7}, \", 4 = \\frac{28}{7}").next_to(number_line, UP, buff=0.5).scale(1.2)
        self.play(Write(step1), run_time=2)
        self.wait(2)

        # Mark the six points
        positions = [22/7, 23/7, 24/7, 25/7, 26/7, 27/7]
        dots = []
        labels = []
        for i, pos in enumerate(positions):
            dot = Dot(point=number_line.n2p(pos), color=GREEN, radius=0.08)
            frac = MathTex(f"\\frac{{{int(pos*7)}}}{{7}}") \
                .next_to(dot, UP if i<3 else DOWN, buff=0.1).scale(0.8)
            dots.append(dot)
            labels.append(frac)

        self.play(*[Create(dot) for dot in dots], run_time=2)
        self.wait(1)
        self.play(*[Write(label) for label in labels], run_time=3)
        self.wait(2)

        # Final answer
        answer = Text("Answer: \\frac{{22}}{{7}}, \\frac{{23}}{{7}}, \\frac{{24}}{{7}}, \\frac{{25}}{{7}}, \\frac{{26}}{{7}}, \\frac{{27}}{{7}}", font_size=28, color=YELLOW)
        answer.next_to(number_line, DOWN, buff=1)
        self.play(Write(answer), run_time=3)
        self.wait(3)

        # Clear screen
        self.play(FadeOut(VGroup(*self.mobjects)))
        summary = Text("Any 6 fractions between 3 and 4 work!", font_size=32, color=GREEN)
        self.play(Write(summary))
        self.wait(2)

# Render command will be: manim -pql E:\code\OnDemand\server\output\manim\doubt_e1d8cd66-f7b2-4d17-a12a-0b4f85ac71dd_1768611319872_1768611319876.py DoubtAnimation
