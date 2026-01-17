
from manim import *

from manim import *

class DoubtAnimation(Scene):
    def construct(self):
        # Title
        title = Text('Why is √2 Irrational?', font_size=48, color=BLUE)
        self.play(Write(title))
        self.wait(2)

        # Decimal expansion
        decimal = MathTex(r'\sqrt{2} = 1.414213562\dots', font_size=36)
        decimal.next_to(title, DOWN)
        self.play(FadeIn(decimal))
        self.wait(2)

        # Rational vs Irrational decimals
        rationals = VGroup(
            MathTex(r'\frac{1}{2} = 0.5', font_size=24),
            MathTex(r'\frac{1}{3} = 0.333\dots', font_size=24)
        ).arrange(RIGHT, buff=1)
        irrationals = MathTex(r'\sqrt{2} = 1.414213562\dots', font_size=24)
        
        labels = VGroup(
            Text('Rational\n(Terminating/Repeating)', font_size=20).next_to(rationals, UP),
            Text('Irrational\n(Non-repeating)', font_size=20).next_to(irrationals, UP)
        )
        
        group = VGroup(rationals, irrationals, labels).shift(UP*0.5)
        self.play(FadeOut(decimal), Transform(title, Text('Decimal Test', font_size=36)))
        self.play(FadeIn(group))
        self.wait(3)

        # Geometric proof setup
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        square = Square(side_length=2, color=YELLOW, fill_opacity=0.3)
        diag = Line(square.get_left(), square.get_right()+RIGHT*0.1, color=RED, stroke_width=8)
        diag_label = MathTex(r'\sqrt{2}', color=RED, font_size=36).next_to(diag, UP)
        
        side_label = MathTex('1', font_size=36).next_to(square, RIGHT)
        self.play(Create(square), Write(side_label))
        self.play(Create(diag), Write(diag_label))
        self.wait(2)

        # Proof by contradiction
        proof_title = Text('Proof by Contradiction', font_size=32, color=GREEN)
        proof_title.to_edge(UP)
        self.play(Write(proof_title))
        
        assume = MathTex(r'\text{Assume: } \sqrt{2} = \frac{p}{q}', font_size=28).shift(DOWN*1.5)
        self.play(Write(assume))
        self.wait(1)

        square_both = MathTex(r'2q^2 = p^2', font_size=28).next_to(assume, DOWN)
        self.play(Write(square_both))
        self.wait(1)

        p_even = MathTex(r'p^2 \text{ even } \implies p \text{ even}', font_size=28, color=ORANGE).next_to(square_both, DOWN)
        self.play(Write(p_even))
        self.wait(1)

        let_p = MathTex(r'p = 2k', font_size=28, color=ORANGE).next_to(p_even, DOWN)
        self.play(Write(let_p))
        self.wait(1)

        contradiction = MathTex(r'2q^2 = 4k^2 \implies q^2 = 2k^2', font_size=28, color=RED).next_to(let_p, DOWN)
        self.play(Write(contradiction))
        self.wait(1)

        final = Text('q even too!\nContradiction!', font_size=32, color=RED).next_to(contradiction, DOWN)
        self.play(Write(final))
        self.wait(3)

        conclusion = Text('∴ √2 is irrational!', font_size=48, color=GREEN).to_edge(DOWN)
        self.play(Write(conclusion))
        self.wait(4)
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait(2)

# Render command will be: manim -pql E:\code\OnDemand\server\output\manim\doubt_e1d8cd66-f7b2-4d17-a12a-0b4f85ac71dd_1768611778117_1768611778119.py DoubtAnimation
