from manim import *

class NumberSystemLesson(Scene):
    def construct(self):
        # Teacher Voice: "Hello! Today we'll learn about the Number System in a very simple way. Don't worry, we'll go step by step!"
        
        # Title Introduction
        title = Text("Number System", font_size=48, color=YELLOW)
        subtitle = Text("Let's understand numbers together!", font_size=28, color=BLUE)
        subtitle.next_to(title, DOWN)
        
        self.play(Write(title))
        self.wait(1.5)
        self.play(FadeIn(subtitle))
        self.wait(2)
        self.play(FadeOut(title), FadeOut(subtitle))
        
        # Teacher Voice: "First, let's think - what are numbers? We use them every day!"
        
        # Real-life context
        intro_text = Text("Numbers are everywhere!", font_size=36, color=GREEN)
        self.play(Write(intro_text))
        self.wait(2)
        
        examples = VGroup(
            Text("📱 Phone: 9876543210", font_size=24),
            Text("💰 Money: ₹50, ₹100", font_size=24),
            Text("📏 Height: 150 cm", font_size=24),
            Text("🌡️ Temperature: 25°C", font_size=24)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        examples.next_to(intro_text, DOWN, buff=0.8)
        
        self.play(FadeOut(intro_text))
        self.play(LaggedStart(*[FadeIn(ex) for ex in examples], lag_ratio=0.5))
        self.wait(3)
        self.play(FadeOut(examples))
        
        # Teacher Voice: "Now, let's see different TYPES of numbers. Think of them as different families!"
        
        # Main Classification Tree
        main_title = Text("Types of Numbers", font_size=40, color=YELLOW)
        main_title.to_edge(UP)
        self.play(Write(main_title))
        self.wait(2)
        
        # Teacher Voice: "We'll learn 5 main types. Let me show you one by one, very slowly."
        
        # Create boxes for number types (slow reveal)
        box_width = 2.5
        box_height = 1.2
        
        # Natural Numbers Box
        natural_box = Rectangle(width=box_width, height=box_height, color=BLUE, fill_opacity=0.2)
        natural_label = Text("Natural\nNumbers", font_size=22, color=BLUE)
        natural_label.move_to(natural_box)
        natural_group = VGroup(natural_box, natural_label)
        natural_group.shift(UP * 1.5 + LEFT * 4)
        
        self.play(Create(natural_box))
        self.wait(0.5)
        self.play(Write(natural_label))
        self.wait(1.5)
        
        # Teacher Voice: "Natural Numbers are counting numbers: 1, 2, 3, 4... These are the numbers we first learn as kids!"
        
        natural_examples = Text("1, 2, 3, 4, 5...", font_size=20, color=BLUE)
        natural_examples.next_to(natural_group, DOWN, buff=0.3)
        self.play(FadeIn(natural_examples))
        self.wait(2)
        
        # Whole Numbers Box
        whole_box = Rectangle(width=box_width, height=box_height, color=GREEN, fill_opacity=0.2)
        whole_label = Text("Whole\nNumbers", font_size=22, color=GREEN)
        whole_label.move_to(whole_box)
        whole_group = VGroup(whole_box, whole_label)
        whole_group.shift(UP * 1.5 + LEFT * 1)
        
        self.play(Create(whole_box))
        self.wait(0.5)
        self.play(Write(whole_label))
        self.wait(1.5)
        
        # Teacher Voice: "Whole Numbers are Natural Numbers PLUS zero. So: 0, 1, 2, 3..."
        
        whole_examples = Text("0, 1, 2, 3, 4...", font_size=20, color=GREEN)
        whole_examples.next_to(whole_group, DOWN, buff=0.3)
        self.play(FadeIn(whole_examples))
        self.wait(2)
        
        # Highlight the difference
        zero_highlight = Text("Includes 0!", font_size=18, color=YELLOW)
        zero_highlight.next_to(whole_examples, DOWN, buff=0.2)
        self.play(FadeIn(zero_highlight, scale=1.2))
        self.wait(2)
        self.play(FadeOut(zero_highlight))
        
        # Integers Box
        integer_box = Rectangle(width=box_width, height=box_height, color=RED, fill_opacity=0.2)
        integer_label = Text("Integers", font_size=22, color=RED)
        integer_label.move_to(integer_box)
        integer_group = VGroup(integer_box, integer_label)
        integer_group.shift(UP * 1.5 + RIGHT * 2)
        
        self.play(Create(integer_box))
        self.wait(0.5)
        self.play(Write(integer_label))
        self.wait(1.5)
        
        # Teacher Voice: "Integers include negative numbers too! Like temperature below 0°C in winter!"
        
        integer_examples = Text("...-2, -1, 0, 1, 2...", font_size=20, color=RED)
        integer_examples.next_to(integer_group, DOWN, buff=0.3)
        self.play(FadeIn(integer_examples))
        self.wait(2)
        
        # Visual number line for integers
        number_line = NumberLine(
            x_range=[-3, 3, 1],
            length=6,
            include_numbers=True,
            font_size=20,
            color=RED
        )
        number_line.shift(DOWN * 0.5)
        
        self.play(Create(number_line))
        self.wait(2)
        
        # Highlight negative and positive
        neg_arrow = Arrow(start=UP*0.3, end=DOWN*0.3, color=ORANGE).next_to(number_line.n2p(-2), UP, buff=0.2)
        neg_text = Text("Negative", font_size=16, color=ORANGE).next_to(neg_arrow, UP, buff=0.1)
        
        pos_arrow = Arrow(start=UP*0.3, end=DOWN*0.3, color=PURPLE).next_to(number_line.n2p(2), UP, buff=0.2)
        pos_text = Text("Positive", font_size=16, color=PURPLE).next_to(pos_arrow, UP, buff=0.1)
        
        self.play(GrowArrow(neg_arrow), Write(neg_text))
        self.wait(1)
        self.play(GrowArrow(pos_arrow), Write(pos_text))
        self.wait(2)
        
        self.play(FadeOut(number_line), FadeOut(neg_arrow), FadeOut(neg_text), 
                  FadeOut(pos_arrow), FadeOut(pos_text))
        
        # Rational Numbers Box
        rational_box = Rectangle(width=box_width, height=box_height, color=PURPLE, fill_opacity=0.2)
        rational_label = Text("Rational\nNumbers", font_size=22, color=PURPLE)
        rational_label.move_to(rational_box)
        rational_group = VGroup(rational_box, rational_label)
        rational_group.shift(DOWN * 1 + LEFT * 2.5)
        
        self.play(Create(rational_box))
        self.wait(0.5)
        self.play(Write(rational_label))
        self.wait(1.5)
        
        # Teacher Voice: "Rational Numbers are fractions! Like half a pizza (1/2) or three-fourths (3/4)"
        
        rational_examples = VGroup(
            Text("1/2, 3/4, -5/2", font_size=18, color=PURPLE),
            Text("Can be written as p/q", font_size=16, color=PURPLE)
        ).arrange(DOWN, buff=0.2)
        rational_examples.next_to(rational_group, DOWN, buff=0.3)
        self.play(FadeIn(rational_examples))
        self.wait(2.5)
        
        # Visual fraction example
        pizza = Circle(radius=0.6, color=ORANGE, fill_opacity=0.3)
        pizza.shift(DOWN * 2.5)
        pizza_half = Sector(outer_radius=0.6, angle=PI, color=YELLOW, fill_opacity=0.6)
        pizza_half.shift(DOWN * 2.5)
        
        fraction_label = Text("1/2", font_size=24, color=YELLOW)
        fraction_label.next_to(pizza, RIGHT, buff=0.5)
        
        self.play(Create(pizza))
        self.wait(0.5)
        self.play(FadeIn(pizza_half))
        self.play(Write(fraction_label))
        self.wait(2)
        self.play(FadeOut(pizza), FadeOut(pizza_half), FadeOut(fraction_label))
        
        # Real Numbers Box
        real_box = Rectangle(width=box_width, height=box_height, color=GOLD, fill_opacity=0.2)
        real_label = Text("Real\nNumbers", font_size=22, color=GOLD)
        real_label.move_to(real_box)
        real_group = VGroup(real_box, real_label)
        real_group.shift(DOWN * 1 + RIGHT * 1.5)
        
        self.play(Create(real_box))
        self.wait(0.5)
        self.play(Write(real_label))
        self.wait(1.5)
        
        # Teacher Voice: "Real Numbers include ALL numbers we've learned plus some special ones like √2, π"
        
        real_examples = Text("All above + √2, π", font_size=18, color=GOLD)
        real_examples.next_to(real_group, DOWN, buff=0.3)
        self.play(FadeIn(real_examples))
        self.wait(2)
        
        # Clear for summary
        self.wait(2)
        self.play(
            FadeOut(natural_group), FadeOut(natural_examples),
            FadeOut(whole_group), FadeOut(whole_examples),
            FadeOut(integer_group), FadeOut(integer_examples),
            FadeOut(rational_group), FadeOut(rational_examples),
            FadeOut(real_group), FadeOut(real_examples)
        )
        
        # Teacher Voice: "Let me show you how these are all connected - like a family tree!"
        
        # Hierarchical Diagram
        main_title.become(Text("How They're Connected", font_size=40, color=YELLOW).to_edge(UP))
        self.play(Transform(main_title, main_title))
        self.wait(1.5)
        
        # Create nested structure
        real_outer = Rectangle(width=10, height=5, color=GOLD)
        real_outer_label = Text("Real Numbers", font_size=24, color=GOLD)
        real_outer_label.next_to(real_outer, UP, buff=0.2)
        
        rational_inner = Rectangle(width=7, height=3.5, color=PURPLE)
        rational_inner.move_to(real_outer).shift(LEFT * 0.5)
        rational_inner_label = Text("Rational", font_size=20, color=PURPLE)
        rational_inner_label.next_to(rational_inner, UP, buff=0.1)
        
        integer_inner = Rectangle(width=4.5, height=2.5, color=RED)
        integer_inner.move_to(rational_inner)
        integer_inner_label = Text("Integers", font_size=18, color=RED)
        integer_inner_label.next_to(integer_inner, UP, buff=0.1)
        
        whole_inner = Rectangle(width=3, height=1.8, color=GREEN)
        whole_inner.move_to(integer_inner)
        whole_inner_label = Text("Whole", font_size=16, color=GREEN)
        whole_inner_label.next_to(whole_inner, UP, buff=0.1)
        
        natural_inner = Rectangle(width=1.8, height=1.2, color=BLUE)
        natural_inner.move_to(whole_inner)
        natural_inner_label = Text("Natural", font_size=14, color=BLUE)
        natural_inner_label.move_to(natural_inner)
        
        # Animate nested structure slowly
        self.play(Create(real_outer), Write(real_outer_label))
        self.wait(1.5)
        self.play(Create(rational_inner), Write(rational_inner_label))
        self.wait(1.5)
        self.play(Create(integer_inner), Write(integer_inner_label))
        self.wait(1.5)
        self.play(Create(whole_inner), Write(whole_inner_label))
        self.wait(1.5)
        self.play(Create(natural_inner), Write(natural_inner_label))
        self.wait(2)
        
        # Teacher Voice: "See? Natural numbers are inside Whole, Whole inside Integers, and so on!"
        
        # Add explanation
        explanation = Text("Each type includes the previous one!", 
                          font_size=24, color=YELLOW)
        explanation.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(explanation))
        self.wait(3)
        
        # Clear for practice
        self.play(
            FadeOut(real_outer), FadeOut(real_outer_label),
            FadeOut(rational_inner), FadeOut(rational_inner_label),
            FadeOut(integer_inner), FadeOut(integer_inner_label),
            FadeOut(whole_inner), FadeOut(whole_inner_label),
            FadeOut(natural_inner), FadeOut(natural_inner_label),
            FadeOut(explanation), FadeOut(main_title)
        )
        
        # Teacher Voice: "Great job! Now let's practice identifying numbers. Take your time!"
        
        # Practice Section
        practice_title = Text("Let's Practice!", font_size=40, color=GREEN)
        self.play(Write(practice_title))
        self.wait(1.5)
        self.play(practice_title.animate.to_edge(UP))
        
        # Example 1
        q1 = Text("Is 5 a Natural Number?", font_size=28, color=WHITE)
        self.play(Write(q1))
        self.wait(2)
        
        ans1 = Text("Yes! ✓", font_size=32, color=GREEN)
        ans1.next_to(q1, DOWN, buff=0.5)
        self.play(FadeIn(ans1, scale=1.3))
        self.wait(1.5)
        
        exp1 = Text("5 is a counting number (1,2,3,4,5...)", font_size=20, color=BLUE)
        exp1.next_to(ans1, DOWN, buff=0.3)
        self.play(FadeIn(exp1))
        self.wait(2.5)
        
        self.play(FadeOut(q1), FadeOut(ans1), FadeOut(exp1))
        
        # Example 2
        q2 = Text("Is -3 a Whole Number?", font_size=28, color=WHITE)
        self.play(Write(q2))
        self.wait(2)
        
        ans2 = Text("No ✗", font_size=32, color=RED)
        ans2.next_to(q2, DOWN, buff=0.5)
        self.play(FadeIn(ans2, scale=1.3))
        self.wait(1.5)
        
        exp2 = Text("Whole numbers are 0,1,2,3... (no negatives)", font_size=20, color=BLUE)
        exp2.next_to(ans2, DOWN, buff=0.3)
        self.play(FadeIn(exp2))
        self.wait(2.5)
        
        exp2_add = Text("But -3 IS an Integer!", font_size=20, color=GREEN)
        exp2_add.next_to(exp2, DOWN, buff=0.2)
        self.play(FadeIn(exp2_add))
        self.wait(2)
        
        self.play(FadeOut(q2), FadeOut(ans2), FadeOut(exp2), FadeOut(exp2_add))
        
        # Example 3
        q3 = Text("Is 1/2 a Rational Number?", font_size=28, color=WHITE)
        self.play(Write(q3))
        self.wait(2)
        
        ans3 = Text("Yes! ✓", font_size=32, color=GREEN)
        ans3.next_to(q3, DOWN, buff=0.5)
        self.play(FadeIn(ans3, scale=1.3))
        self.wait(1.5)
        
        exp3 = Text("It's in p/q form (1/2)", font_size=20, color=BLUE)
        exp3.next_to(ans3, DOWN, buff=0.3)
        self.play(FadeIn(exp3))
        self.wait(2.5)
        
        self.play(FadeOut(q3), FadeOut(ans3), FadeOut(exp3))
        
        # Teacher Voice: "Excellent! You're doing great. Remember, practice makes perfect!"
        
        # Encouraging conclusion
        self.play(FadeOut(practice_title))
        
        final_message = VGroup(
            Text("🌟 Well Done! 🌟", font_size=40, color=YELLOW),
            Text("You learned the Number System!", font_size=28, color=GREEN),
            Text("Keep practicing, you're doing amazing!", font_size=24, color=BLUE)
        ).arrange(DOWN, buff=0.5)
        
        self.play(LaggedStart(*[FadeIn(line, scale=1.2) for line in final_message], lag_ratio=0.5))
        self.wait(3)
        
        # Summary box
        summary_box = Rectangle(width=11, height=3, color=YELLOW, fill_opacity=0.1)
        summary_text = VGroup(
            Text("Quick Recap:", font_size=24, color=YELLOW),
            Text("Natural: 1,2,3... | Whole: 0,1,2... | Integers: ...−2,−1,0,1,2...", font_size=18),
            Text("Rational: p/q form | Real: All numbers", font_size=18)
        ).arrange(DOWN, buff=0.3)
        summary_text.move_to(summary_box)
        
        self.play(FadeOut(final_message))
        self.play(Create(summary_box))
        self.play(FadeIn(summary_text))
        self.wait(4)
        
        self.play(FadeOut(summary_box), FadeOut(summary_text))
        
        # Final encouragement
        end_text = Text("See you in the next lesson! 📚", font_size=32, color=GREEN)
        self.play(Write(end_text))
        self.wait(2)
        self.play(FadeOut(end_text))