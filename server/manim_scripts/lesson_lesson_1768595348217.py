from manim import *

class NumberSystemLesson(Scene):
    def construct(self):
        # ========== INTRODUCTION ==========
        # Title with welcoming animation
        title = Text("Number System", font_size=56, color=YELLOW, weight=BOLD)
        subtitle = Text("Understanding Different Types of Numbers", font_size=28, color=BLUE)
        subtitle.next_to(title, DOWN)
        
        self.play(Write(title), run_time=2)
        self.wait(1)
        self.play(FadeIn(subtitle, shift=UP))
        self.wait(2)
        self.play(FadeOut(title), FadeOut(subtitle))
        
        # ========== SECTION 1: NATURAL NUMBERS ==========
        # Teacher says: "Let's start with the simplest numbers - the ones we use for counting!"
        
        natural_title = Text("1. Natural Numbers (N)", font_size=40, color=GREEN)
        natural_title.to_edge(UP)
        self.play(Write(natural_title))
        self.wait(1)
        
        # Definition with MathTex
        natural_def = MathTex(
            r"\mathbb{N} = \{1, 2, 3, 4, 5, ...\}",
            font_size=44,
            color=GREEN
        )
        natural_def.shift(UP * 2)
        self.play(Write(natural_def))
        self.wait(2)
        
        # Visual representation - counting objects
        explanation = Text("Numbers we use for counting", font_size=32, color=WHITE)
        explanation.next_to(natural_def, DOWN, buff=0.5)
        self.play(FadeIn(explanation))
        self.wait(1)
        
        # Animated counting with circles
        circles = VGroup()
        for i in range(5):
            circle = Circle(radius=0.3, color=GREEN, fill_opacity=0.6)
            circle.shift(LEFT * 4 + RIGHT * i * 1.5 + DOWN * 1)
            number = MathTex(str(i + 1), color=WHITE, font_size=36)
            number.move_to(circle)
            circles.add(VGroup(circle, number))
        
        for i, circle_group in enumerate(circles):
            self.play(Create(circle_group), run_time=0.5)
            self.wait(0.3)
        
        self.wait(2)
        self.play(FadeOut(circles), FadeOut(explanation), FadeOut(natural_def))
        
        # ========== SECTION 2: WHOLE NUMBERS ==========
        # Teacher says: "Now, what if we add zero to natural numbers?"
        
        whole_title = Text("2. Whole Numbers (W)", font_size=40, color=BLUE)
        whole_title.to_edge(UP)
        self.play(Transform(natural_title, whole_title))
        self.wait(1)
        
        # Definition with MathTex
        whole_def = MathTex(
            r"\mathbb{W} = \{0, 1, 2, 3, 4, 5, ...\}",
            font_size=44,
            color=BLUE
        )
        whole_def.shift(UP * 2)
        self.play(Write(whole_def))
        self.wait(2)
        
        # Highlight the zero
        zero_highlight = SurroundingRectangle(whole_def[0][3], color=YELLOW, buff=0.1)
        self.play(Create(zero_highlight))
        self.wait(1)
        
        explanation2 = Text("Natural Numbers + Zero", font_size=32, color=WHITE)
        explanation2.next_to(whole_def, DOWN, buff=0.5)
        self.play(FadeIn(explanation2))
        self.wait(2)
        
        self.play(FadeOut(zero_highlight), FadeOut(explanation2), FadeOut(whole_def))
        
        # ========== SECTION 3: INTEGERS ==========
        # Teacher says: "What about negative numbers? Let's explore integers!"
        
        integer_title = Text("3. Integers (Z)", font_size=40, color=RED)
        integer_title.to_edge(UP)
        self.play(Transform(natural_title, integer_title))
        self.wait(1)
        
        # Definition with MathTex
        integer_def = MathTex(
            r"\mathbb{Z} = \{..., -3, -2, -1, 0, 1, 2, 3, ...\}",
            font_size=40,
            color=RED
        )
        integer_def.shift(UP * 2)
        self.play(Write(integer_def))
        self.wait(2)
        
        # Number line visualization
        number_line = NumberLine(
            x_range=[-5, 5, 1],
            length=10,
            color=WHITE,
            include_numbers=True,
            label_direction=DOWN,
            font_size=28
        )
        number_line.shift(DOWN * 0.5)
        self.play(Create(number_line))
        self.wait(1)
        
        # Animate points on number line
        negative_label = Text("Negative", font_size=28, color=RED)
        negative_label.next_to(number_line.n2p(-3), UP)
        positive_label = Text("Positive", font_size=28, color=GREEN)
        positive_label.next_to(number_line.n2p(3), UP)
        zero_label = Text("Zero", font_size=28, color=YELLOW)
        zero_label.next_to(number_line.n2p(0), DOWN, buff=0.5)
        
        self.play(Write(negative_label), Write(positive_label), Write(zero_label))
        self.wait(2)
        
        self.play(
            FadeOut(number_line), 
            FadeOut(negative_label), 
            FadeOut(positive_label),
            FadeOut(zero_label),
            FadeOut(integer_def)
        )
        
        # ========== SECTION 4: RATIONAL NUMBERS ==========
        # Teacher says: "Now let's look at fractions - these are rational numbers!"
        
        rational_title = Text("4. Rational Numbers (Q)", font_size=40, color=PURPLE)
        rational_title.to_edge(UP)
        self.play(Transform(natural_title, rational_title))
        self.wait(1)
        
        # Definition with MathTex
        rational_def = MathTex(
            r"\mathbb{Q} = \left\{\frac{p}{q} \mid p, q \in \mathbb{Z}, q \neq 0\right\}",
            font_size=40,
            color=PURPLE
        )
        rational_def.shift(UP * 2)
        self.play(Write(rational_def))
        self.wait(2)
        
        # Simple explanation
        simple_exp = Text("Numbers that can be written as fractions", font_size=30, color=WHITE)
        simple_exp.next_to(rational_def, DOWN, buff=0.5)
        self.play(FadeIn(simple_exp))
        self.wait(1)
        
        # Examples with visual fractions
        examples = VGroup(
            MathTex(r"\frac{1}{2}", font_size=48, color=PURPLE),
            MathTex(r"\frac{3}{4}", font_size=48, color=PURPLE),
            MathTex(r"\frac{-5}{7}", font_size=48, color=PURPLE),
            MathTex(r"0.5 = \frac{1}{2}", font_size=40, color=PURPLE)
        )
        examples.arrange(RIGHT, buff=1)
        examples.shift(DOWN * 1)
        
        for example in examples:
            self.play(Write(example), run_time=1)
            self.wait(0.5)
        
        self.wait(2)
        self.play(FadeOut(examples), FadeOut(simple_exp), FadeOut(rational_def))
        
        # ========== SECTION 5: IRRATIONAL NUMBERS ==========
        # Teacher says: "Some numbers cannot be written as fractions - these are irrational!"
        
        irrational_title = Text("5. Irrational Numbers", font_size=40, color=ORANGE)
        irrational_title.to_edge(UP)
        self.play(Transform(natural_title, irrational_title))
        self.wait(1)
        
        # Definition
        irrational_def = Text(
            "Numbers that CANNOT be written as fractions",
            font_size=32,
            color=ORANGE
        )
        irrational_def.shift(UP * 2)
        self.play(Write(irrational_def))
        self.wait(2)
        
        # Examples with MathTex
        irr_examples = VGroup(
            MathTex(r"\pi = 3.14159...", font_size=44, color=ORANGE),
            MathTex(r"\sqrt{2} = 1.41421...", font_size=44, color=ORANGE),
            MathTex(r"\sqrt{3}, \sqrt{5}, e, ...", font_size=40, color=ORANGE)
        )
        irr_examples.arrange(DOWN, buff=0.5)
        irr_examples.shift(DOWN * 0.5)
        
        for example in irr_examples:
            self.play(Write(example), run_time=1)
            self.wait(1)
        
        self.wait(2)
        self.play(FadeOut(irr_examples), FadeOut(irrational_def))
        
        # ========== SECTION 6: REAL NUMBERS ==========
        # Teacher says: "When we combine rational and irrational numbers, we get real numbers!"
        
        real_title = Text("6. Real Numbers (R)", font_size=40, color=GOLD)
        real_title.to_edge(UP)
        self.play(Transform(natural_title, real_title))
        self.wait(1)
        
        # Definition
        real_def = MathTex(
            r"\mathbb{R} = \mathbb{Q} \cup \text{Irrational Numbers}",
            font_size=40,
            color=GOLD
        )
        real_def.shift(UP * 2)
        self.play(Write(real_def))
        self.wait(2)
        
        explanation3 = Text("All numbers on the number line", font_size=32, color=WHITE)
        explanation3.next_to(real_def, DOWN, buff=0.5)
        self.play(FadeIn(explanation3))
        self.wait(2)
        
        self.play(FadeOut(explanation3), FadeOut(real_def))
        
        # ========== SECTION 7: VENN DIAGRAM ==========
        # Teacher says: "Let's see how all these numbers are related!"
        
        venn_title = Text("How Numbers are Related", font_size=40, color=YELLOW)
        venn_title.to_edge(UP)
        self.play(Transform(natural_title, venn_title))
        self.wait(1)
        
        # Create nested circles for Venn diagram
        real_circle = Circle(radius=3, color=GOLD, stroke_width=4)
        real_label = Text("Real (R)", font_size=28, color=GOLD)
        real_label.move_to(real_circle.get_top() + DOWN * 0.3)
        
        rational_circle = Circle(radius=2.3, color=PURPLE, stroke_width=4)
        rational_circle.shift(LEFT * 0.5)
        rational_label = Text("Rational (Q)", font_size=24, color=PURPLE)
        rational_label.move_to(rational_circle.get_top() + DOWN * 0.3)
        
        integer_circle = Circle(radius=1.6, color=RED, stroke_width=4)
        integer_circle.shift(LEFT * 0.5)
        integer_label = Text("Integers (Z)", font_size=20, color=RED)
        integer_label.move_to(integer_circle.get_top() + DOWN * 0.3)
        
        whole_circle = Circle(radius=1, color=BLUE, stroke_width=4)
        whole_circle.shift(LEFT * 0.5)
        whole_label = Text("Whole (W)", font_size=18, color=BLUE)
        whole_label.move_to(whole_circle.get_top() + DOWN * 0.3)
        
        natural_circle = Circle(radius=0.5, color=GREEN, stroke_width=4)
        natural_circle.shift(LEFT * 0.5)
        natural_label = Text("Natural (N)", font_size=16, color=GREEN)
        natural_label.move_to(natural_circle)
        
        # Irrational section
        irrational_label = Text("Irrational", font_size=24, color=ORANGE)
        irrational_label.move_to(real_circle.get_right() + LEFT * 1.2)
        
        # Animate Venn diagram creation
        self.play(Create(real_circle), Write(real_label))
        self.wait(1)
        self.play(Create(rational_circle), Write(rational_label))
        self.wait(1)
        self.play(Write(irrational_label))
        self.wait(1)
        self.play(Create(integer_circle), Write(integer_label))
        self.wait(1)
        self.play(Create(whole_circle), Write(whole_label))
        self.wait(1)
        self.play(Create(natural_circle), Write(natural_label))
        self.wait(3)
        
        # Clear for summary
        self.play(
            FadeOut(real_circle), FadeOut(rational_circle), FadeOut(integer_circle),
            FadeOut(whole_circle), FadeOut(natural_circle),
            FadeOut(real_label), FadeOut(rational_label), FadeOut(integer_label),
            FadeOut(whole_label), FadeOut(natural_label), FadeOut(irrational_label)
        )
        
        # ========== SECTION 8: SUMMARY TABLE ==========
        # Teacher says: "Let's review everything we learned!"
        
        summary_title = Text("Summary", font_size=44, color=YELLOW, weight=BOLD)
        summary_title.to_edge(UP)
        self.play(Transform(natural_title, summary_title))
        self.wait(1)
        
        # Create summary table
        table_data = [
            ["Number Type", "Symbol", "Example"],
            ["Natural", "N", "1, 2, 3, ..."],
            ["Whole", "W", "0, 1, 2, ..."],
            ["Integers", "Z", "..., -1, 0, 1, ..."],
            ["Rational", "Q", "1/2, 3/4, 0.5"],
            ["Irrational", "-", "π, √2"],
            ["Real", "R", "All above"]
        ]
        
        table = Table(
            table_data,
            include_outer_lines=True,
            line_config={"stroke_width": 2, "color": WHITE}
        )
        table.scale(0.5)
        table.shift(DOWN * 0.5)
        
        # Color code the table
        table.get_rows()[1].set_color(GREEN)
        table.get_rows()[2].set_color(BLUE)
        table.get_rows()[3].set_color(RED)
        table.get_rows()[4].set_color(PURPLE)
        table.get_rows()[5].set_color(ORANGE)
        table.get_rows()[6].set_color(GOLD)
        
        self.play(Create(table), run_time=3)
        self.wait(3)
        
        # Highlight each row
        for i in range(1, 7):
            highlight = SurroundingRectangle(table.get_rows()[i], color=YELLOW, buff=0.05)
            self.play(Create(highlight), run_time=0.5)
            self.wait(0.5)
            self.play(FadeOut(highlight), run_time=0.3)
        
        self.wait(2)
        
        # ========== CONCLUSION ==========
        # Teacher says: "Great job! You now understand the number system!"
        
        self.play(FadeOut(table), FadeOut(natural_title))
        
        conclusion = Text("You did great! Keep practicing!", font_size=40, color=GREEN)
        self.play(Write(conclusion))
        self.wait(2)
        
        final_message = Text("Remember: Practice makes perfect!", font_size=32, color=YELLOW)
        final_message.next_to(conclusion, DOWN)
        self.play(FadeIn(final_message, shift=UP))
        self.wait(3)
        
        self.play(FadeOut(conclusion), FadeOut(final_message))