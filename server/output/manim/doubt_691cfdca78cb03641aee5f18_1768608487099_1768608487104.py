
from manim import *

from manim import *

class DoubtAnimation(Scene):
    def construct(self):
        # Scene 1: Show number line with rational numbers
        number_line = NumberLine(x_range=[0,2,0.2], length=8, include_numbers=True)
        self.play(Create(number_line), run_time=2)
        self.wait(1)
        rationals = [MathTex(r"\frac{1}{2}"), MathTex(r"1"), MathTex(r"\frac{3}{2}")]
        positions = [0.5, 1, 1.5]
        for tex, pos in zip(rationals, positions):
            tex.next_to(number_line.n2p(pos), DOWN)
            self.play(FadeIn(tex), run_time=1)
        self.wait(1)
        # Scene 2: Show sqrt(2) on number line
        sqrt2_dot = Dot(number_line.n2p(2**0.5), color=YELLOW)
        sqrt2_label = MathTex(r"\sqrt{2}", color=YELLOW).next_to(number_line.n2p(2**0.5), UP)
        self.play(GrowFromCenter(sqrt2_dot), Write(sqrt2_label), run_time=2)
        self.wait(1)
        # Scene 3: Assume sqrt(2) = a/b
        eq1 = MathTex(r"\sqrt{2} = \frac{a}{b}", color=BLUE).to_edge(UP)
        self.play(Write(eq1), run_time=2)
        self.wait(1)
        # Scene 4: Square both sides
        eq2 = MathTex(r"2 = \frac{a^2}{b^2}", color=BLUE).next_to(eq1, DOWN)
        self.play(TransformFromCopy(eq1, eq2), run_time=2)
        self.wait(1)
        eq3 = MathTex(r"a^2 = 2b^2").next_to(eq2, DOWN)
        self.play(Write(eq3), run_time=2)
        self.wait(1)
        # Scene 5: Visual Even Numbers
        even_box = SurroundingRectangle(eq3, color=GREEN)
        even_text = Text("a² is even, so a is even", color=GREEN).next_to(eq3, DOWN)
        self.play(Create(even_box), Write(even_text), run_time=2)
        self.wait(2)
        # Scene 6: Contradiction
        cross = Cross(eq1, color=RED)
        contradiction = Text("Both a and b can't be even!", color=RED).to_edge(DOWN)
        self.play(Create(cross), FadeIn(contradiction), run_time=2)
        self.wait(2)
        # Scene 7: Conclusion
        conclusion = Text("So, √2 is irrational!", color=YELLOW).scale(1.2).move_to(ORIGIN)
        self.play(FadeOut(eq1), FadeOut(eq2), FadeOut(eq3), FadeOut(even_box), FadeOut(even_text), FadeOut(cross), FadeOut(contradiction))
        self.play(Write(conclusion), run_time=2)
        self.wait(2)

# Render command will be: manim -pql E:\code\OnDemand\server\output\manim\doubt_691cfdca78cb03641aee5f18_1768608487099_1768608487104.py DoubtAnimation
