
from manim import *

from manim import *

class DoubtAnimation(Scene):
    def construct(self):
        # Scene 1: Title
        title = Text("Rational vs Irrational Numbers", font_size=38, color=YELLOW)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Scene 2: Number line
        number_line = NumberLine(x_range=[0, 3, 0.5], length=8, include_numbers=True)
        self.play(Create(number_line), run_time=2)
        self.wait(1)

        # Mark a rational number (1.5 = 3/2)
        r_dot = Dot(number_line.n2p(1.5), color=BLUE)
        r_label = MathTex("1.5 = \\frac{3}{2}", font_size=32, color=BLUE).next_to(r_dot, DOWN)
        self.play(FadeIn(r_dot), Write(r_label), run_time=1)
        self.wait(1)

        # Show its decimal expansion
        dec1 = Text("1.5 = 1.5000... (terminates)", font_size=28, color=BLUE).to_edge(DOWN)
        self.play(Write(dec1), run_time=1)
        self.wait(1)

        # Mark an irrational number (√2)
        ir_dot = Dot(number_line.n2p(2**0.5), color=RED)
        ir_label = MathTex("\\sqrt{2}", font_size=32, color=RED).next_to(ir_dot, UP)
        self.play(FadeIn(ir_dot), Write(ir_label), run_time=1)
        self.wait(1)

        # Show its decimal expansion
        dec2 = Text("√2 ≈ 1.414213... (never ends)", font_size=28, color=RED).to_edge(UP)
        self.play(Write(dec2), run_time=1)
        self.wait(2)

        # Highlight difference
        highlight = SurroundingRectangle(ir_label, color=YELLOW, buff=0.2)
        self.play(Create(highlight), run_time=1)
        note = Text("Irrational: can't be a simple fraction", font_size=26, color=YELLOW).next_to(ir_label, RIGHT)
        self.play(Write(note), run_time=1)
        self.wait(2)

        # Fade out everything
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait()

# Render command will be: manim -pql E:\code\OnDemand\server\output\manim\doubt_followup_1768606096495_1768606096495.py DoubtAnimation
