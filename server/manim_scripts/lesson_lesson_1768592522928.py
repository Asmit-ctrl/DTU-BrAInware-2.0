from manim import *

class NumberSystemLesson(Scene):
    def construct(self):
        # Teacher Voice: "Hello! Today we'll learn about the Number System. Don't worry, we'll go very slowly and make it super easy!"
        
        # Title Introduction
        title = Text("Number System", font_size=48, color=YELLOW)
        subtitle = Text("Let's understand numbers step by step", font_size=28, color=WHITE)
        subtitle.next_to(title, DOWN)
        
        self.play(Write(title))
        self.wait(2)
        self.play(FadeIn(subtitle))
        self.wait(3)
        self.play(FadeOut(title), FadeOut(subtitle))
        
        # Teacher Voice: "Numbers are everywhere! When you count your books, when you check the temperature, when you buy things - numbers help us!"
        
        # Section 1: What are Numbers?
        intro_text = Text("What are Numbers?", font_size=40, color=BLUE)
        self.play(Write(intro_text))
        self.wait(2)
        
        examples = VGroup(
            Text("📚 Counting books: 1, 2, 3...", font_size=28),
            Text("🌡️ Temperature: 25°C", font_size=28),
            Text("💰 Money: ₹50", font_size=28),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.5)
        examples.next_to(intro_text, DOWN, buff=1)
        
        self.play(FadeOut(intro_text))
        for example in examples:
            self.play(Write(example))
            self.wait(2)
        
        self.wait(2)
        self.play(FadeOut(examples))
        
        # Teacher Voice: "Now let's learn different TYPES of numbers. We'll start with the simplest ones!"
        
        # Section 2: Natural Numbers
        natural_title = Text("1. Natural Numbers (N)", font_size=40, color=GREEN)
        self.play(Write(natural_title))
        self.wait(2)
        self.play(natural_title.animate.to_edge(UP))
        
        # Teacher Voice: "Natural numbers are the numbers we use for counting. They start from 1 and go on forever!"
        
        natural_def = Text(
            "Numbers used for counting",
            font_size=32,
            color=WHITE
        ).next_to(natural_title, DOWN, buff=0.5)
        
        self.play(Write(natural_def))
        self.wait(3)
        
        # Visual representation with objects
        natural_example = Text("Example: Counting apples 🍎", font_size=28, color=YELLOW)
        natural_example.next_to(natural_def, DOWN, buff=0.8)
        self.play(Write(natural_example))
        self.wait(2)
        
        # Animated counting
        apples = VGroup()
        numbers = VGroup()
        for i in range(1, 6):
            apple = Text("🍎", font_size=40)
            num = Text(str(i), font_size=32, color=GREEN)
            apples.add(apple)
            numbers.add(num)
        
        apples.arrange(RIGHT, buff=0.5)
        numbers.arrange(RIGHT, buff=0.5)
        apples.next_to(natural_example, DOWN, buff=0.8)
        numbers.next_to(apples, DOWN, buff=0.5)
        
        for i in range(5):
            self.play(FadeIn(apples[i]), FadeIn(numbers[i]))
            self.wait(1.5)
        
        self.wait(2)
        
        # Natural numbers set notation
        natural_set = MathTex(
            r"\mathbb{N} = \{1, 2, 3, 4, 5, ...\}",
            font_size=36,
            color=GREEN
        ).next_to(numbers, DOWN, buff=0.8)
        
        self.play(Write(natural_set))
        self.wait(3)
        
        # Teacher Voice: "See? 1, 2, 3, 4, 5... and it goes on! These are Natural Numbers."
        
        self.play(
            FadeOut(natural_def),
            FadeOut(natural_example),
            FadeOut(apples),
            FadeOut(numbers),
            FadeOut(natural_set)
        )
        self.wait(1)
        
        # Section 3: Whole Numbers
        whole_title = Text("2. Whole Numbers (W)", font_size=40, color=ORANGE)
        whole_title.next_to(natural_title, DOWN, buff=0.5)
        self.play(Write(whole_title))
        self.wait(2)
        
        # Teacher Voice: "Whole numbers are just like Natural numbers, but we add ONE special number - ZERO!"
        
        whole_def = Text(
            "Natural Numbers + Zero (0)",
            font_size=32,
            color=WHITE
        ).next_to(whole_title, DOWN, buff=0.5)
        
        self.play(Write(whole_def))
        self.wait(3)
        
        # Visual: Adding zero
        whole_example = Text("Example: Apples in an empty basket", font_size=28, color=YELLOW)
        whole_example.next_to(whole_def, DOWN, buff=0.8)
        self.play(Write(whole_example))
        self.wait(2)
        
        basket = Text("🧺", font_size=50)
        zero_text = Text("0 apples", font_size=32, color=ORANGE)
        basket.next_to(whole_example, DOWN, buff=0.8)
        zero_text.next_to(basket, RIGHT, buff=0.5)
        
        self.play(FadeIn(basket), Write(zero_text))
        self.wait(3)
        
        # Whole numbers set notation
        whole_set = MathTex(
            r"\mathbb{W} = \{0, 1, 2, 3, 4, 5, ...\}",
            font_size=36,
            color=ORANGE
        ).next_to(basket, DOWN, buff=1)
        
        self.play(Write(whole_set))
        self.wait(3)
        
        # Teacher Voice: "Zero means 'nothing' or 'empty'. When we add 0 to Natural Numbers, we get Whole Numbers!"
        
        self.play(
            FadeOut(whole_def),
            FadeOut(whole_example),
            FadeOut(basket),
            FadeOut(zero_text),
            FadeOut(whole_set)
        )
        self.wait(1)
        
        # Section 4: Integers
        integer_title = Text("3. Integers (Z)", font_size=40, color=RED)
        integer_title.next_to(whole_title, DOWN, buff=0.5)
        self.play(Write(integer_title))
        self.wait(2)
        
        # Teacher Voice: "Now comes something new - Integers! These include negative numbers too!"
        
        integer_def = Text(
            "Whole Numbers + Negative Numbers",
            font_size=32,
            color=WHITE
        ).next_to(integer_title, DOWN, buff=0.5)
        
        self.play(Write(integer_def))
        self.wait(3)
        
        # Real-life example
        integer_example = Text("Example: Temperature", font_size=28, color=YELLOW)
        integer_example.next_to(integer_def, DOWN, buff=0.8)
        self.play(Write(integer_example))
        self.wait(2)
        
        # Temperature examples
        temp_examples = VGroup(
            Text("Hot day: +35°C", font_size=28, color=RED),
            Text("Normal: 0°C", font_size=28, color=WHITE),
            Text("Cold day: -5°C", font_size=28, color=BLUE),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        temp_examples.next_to(integer_example, DOWN, buff=0.8)
        
        for temp in temp_examples:
            self.play(Write(temp))
            self.wait(2)
        
        self.wait(2)
        
        # Integer set notation
        integer_set = MathTex(
            r"\mathbb{Z} = \{..., -3, -2, -1, 0, 1, 2, 3, ...\}",
            font_size=32,
            color=RED
        ).next_to(temp_examples, DOWN, buff=0.8)
        
        self.play(Write(integer_set))
        self.wait(3)
        
        # Teacher Voice: "Positive numbers, zero, and negative numbers together make Integers!"
        
        self.play(
            FadeOut(integer_def),
            FadeOut(integer_example),
            FadeOut(temp_examples),
            FadeOut(integer_set)
        )
        self.wait(1)
        
        # Clear all titles
        self.play(
            FadeOut(natural_title),
            FadeOut(whole_title),
            FadeOut(integer_title)
        )
        self.wait(1)
        
        # Section 5: Number Line Visualization
        # Teacher Voice: "Let's see all these numbers on a NUMBER LINE. This will make everything crystal clear!"
        
        numberline_title = Text("Number Line", font_size=40, color=PURPLE)
        self.play(Write(numberline_title))
        self.wait(2)
        self.play(numberline_title.animate.to_edge(UP))
        
        # Create number line
        number_line = NumberLine(
            x_range=[-5, 6, 1],
            length=12,
            include_numbers=True,
            label_direction=DOWN,
            font_size=28,
        )
        number_line.shift(DOWN * 0.5)
        
        self.play(Create(number_line))
        self.wait(2)
        
        # Highlight different number types
        # Negative integers
        neg_label = Text("Negative Integers", font_size=24, color=BLUE)
        neg_label.next_to(number_line, UP, buff=1.5).shift(LEFT * 4)
        neg_arrow = Arrow(
            neg_label.get_bottom(),
            number_line.n2p(-3),
            color=BLUE,
            buff=0.1
        )
        
        self.play(Write(neg_label), Create(neg_arrow))
        self.wait(2)
        
        # Highlight negative numbers on line
        neg_dots = VGroup(*[
            Dot(number_line.n2p(i), color=BLUE, radius=0.1)
            for i in range(-5, 0)
        ])
        self.play(FadeIn(neg_dots))
        self.wait(2)
        
        # Zero
        zero_label = Text("Zero", font_size=24, color=YELLOW)
        zero_label.next_to(number_line, UP, buff=1.5)
        zero_arrow = Arrow(
            zero_label.get_bottom(),
            number_line.n2p(0),
            color=YELLOW,
            buff=0.1
        )
        
        self.play(Write(zero_label), Create(zero_arrow))
        zero_dot = Dot(number_line.n2p(0), color=YELLOW, radius=0.12)
        self.play(FadeIn(zero_dot))
        self.wait(2)
        
        # Natural/Positive numbers
        pos_label = Text("Natural Numbers", font_size=24, color=GREEN)
        pos_label.next_to(number_line, UP, buff=1.5).shift(RIGHT * 4)
        pos_arrow = Arrow(
            pos_label.get_bottom(),
            number_line.n2p(3),
            color=GREEN,
            buff=0.1
        )
        
        self.play(Write(pos_label), Create(pos_arrow))
        self.wait(2)
        
        # Highlight positive numbers
        pos_dots = VGroup(*[
            Dot(number_line.n2p(i), color=GREEN, radius=0.1)
            for i in range(1, 6)
        ])
        self.play(FadeIn(pos_dots))
        self.wait(3)
        
        # Teacher Voice: "See how beautifully all numbers are arranged? Negative on left, zero in middle, positive on right!"
        
        self.wait(2)
        
        # Clear number line section
        self.play(
            FadeOut(neg_label), FadeOut(neg_arrow), FadeOut(neg_dots),
            FadeOut(zero_label), FadeOut(zero_arrow), FadeOut(zero_dot),
            FadeOut(pos_label), FadeOut(pos_arrow), FadeOut(pos_dots),
            FadeOut(number_line),
            FadeOut(numberline_title)
        )
        self.wait(1)
        
        # Section 6: Summary
        # Teacher Voice: "Great job! Let's quickly review what we learned today!"
        
        summary_title = Text("Quick Summary", font_size=44, color=GOLD)
        self.play(Write(summary_title))
        self.wait(2)
        self.play(summary_title.animate.to_edge(UP))
        
        summary_points = VGroup(
            Text("✓ Natural Numbers (N): 1, 2, 3, 4, ...", font_size=28, color=GREEN),
            Text("✓ Whole Numbers (W): 0, 1, 2, 3, ...", font_size=28, color=ORANGE),
            Text("✓ Integers (Z): ..., -2, -1, 0, 1, 2, ...", font_size=28, color=RED),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.6)
        summary_points.next_to(summary_title, DOWN, buff=1)
        
        for point in summary_points:
            self.play(Write(point))
            self.wait(2.5)
        
        self.wait(2)
        
        # Relationship diagram
        relationship_text = Text("Relationship:", font_size=32, color=YELLOW)
        relationship_text.next_to(summary_points, DOWN, buff=1)
        self.play(Write(relationship_text))
        self.wait(2)
        
        # Visual hierarchy
        relation = MathTex(
            r"\mathbb{N} \subset \mathbb{W} \subset \mathbb{Z}",
            font_size=40,
            color=WHITE
        ).next_to(relationship_text, DOWN, buff=0.5)
        
        self.play(Write(relation))
        self.wait(2)
        
        explanation = Text(
            "(Natural ⊂ Whole ⊂ Integers)",
            font_size=24,
            color=GRAY
        ).next_to(relation, DOWN, buff=0.3)
        self.play(FadeIn(explanation))
        self.wait(3)
        
        # Teacher Voice: "Remember: Natural numbers are inside Whole numbers, and Whole numbers are inside Integers!"
        
        self.wait(2)
        
        # Encouragement
        self.play(
            FadeOut(summary_points),
            FadeOut(relationship_text),
            FadeOut(relation),
            FadeOut(explanation),
            FadeOut(summary_title)
        )
        
        # Teacher Voice: "You did amazing! Practice these concepts and you'll master the Number System very soon!"
        
        final_message = Text(
            "Keep Practicing! You're doing great! 🌟",
            font_size=36,
            color=YELLOW
        )
        self.play(Write(final_message))
        self.wait(3)
        
        self.play(FadeOut(final_message))
        self.wait(1)