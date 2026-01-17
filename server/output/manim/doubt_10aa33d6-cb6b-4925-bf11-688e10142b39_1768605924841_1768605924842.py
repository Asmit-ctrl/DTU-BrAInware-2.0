
from manim import *

from manim import *

class DoubtAnimation(Scene):
    def construct(self):
        # Scene 1: Title
        title = Text("Is √2 Rational or Irrational?", font_size=40, color=YELLOW)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Scene 2: Number line with rational numbers
        number_line = NumberLine(x_range=[0, 2.5, 0.5], length=8, include_numbers=True)
        self.play(Create(number_line), run_time=2)
        self.wait(1)

        # Mark some rational numbers
        rationals = [1, 1.5, 2]
        rational_labels = []
        for x in rationals:
            dot = Dot(number_line.n2p(x), color=BLUE)
            label = MathTex(f"{int(x*2)}/2" if x != int(x) else f"{int(x)}", font_size=32).next_to(dot, DOWN)
            self.play(FadeIn(dot), Write(label), run_time=1)
            rational_labels.append((dot, label))
        self.wait(1)

        # Scene 3: Placing sqrt(2) on the number line
        sqrt2_pos = number_line.n2p(2**0.5)
        sqrt2_dot = Dot(sqrt2_pos, color=RED)
        sqrt2_label = MathTex("\\sqrt{2}", font_size=36, color=RED).next_to(sqrt2_dot, UP)
        self.play(FadeIn(sqrt2_dot), Write(sqrt2_label), run_time=2)
        self.wait(1)

        # Scene 4: Decimal expansion
        decimal_text = Text("√2 ≈ 1.4142135...", font_size=36, color=RED).to_edge(DOWN)
        self.play(Write(decimal_text), run_time=2)
        self.wait(1)

        # Scene 5: Show it never ends or repeats
        arrow = Arrow(decimal_text.get_right(), decimal_text.get_right() + RIGHT*1.5, color=RED)
        never_ends = Text("Never ends, never repeats!", font_size=32, color=RED).next_to(arrow, RIGHT)
        self.play(GrowArrow(arrow), Write(never_ends), run_time=2)
        self.wait(2)

        # Fade out everything
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait()

# Render command will be: manim -pql E:\code\OnDemand\server\output\manim\doubt_10aa33d6-cb6b-4925-bf11-688e10142b39_1768605924841_1768605924842.py DoubtAnimation
