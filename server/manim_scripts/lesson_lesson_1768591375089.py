from manim import *

class NumberSystemLesson(Scene):
    def construct(self):
        # PART 1: INTRODUCTION
        # Teacher Voice: "Hello! Today we'll learn about the Number System. Don't worry, we'll go step by step!"
        
        title = Text("Number System", font_size=48, color=BLUE)
        subtitle = Text("Let's understand numbers together!", font_size=28, color=YELLOW)
        subtitle.next_to(title, DOWN)
        
        self.play(Write(title), run_time=2)
        self.wait(1)
        self.play(FadeIn(subtitle), run_time=1.5)
        self.wait(2)
        self.play(FadeOut(title), FadeOut(subtitle))
        
        # PART 2: WHAT ARE NUMBERS?
        # Teacher Voice: "Numbers are symbols we use to count and measure things around us."
        
        question = Text("What are Numbers?", font_size=40, color=GREEN)
        self.play(Write(question), run_time=2)
        self.wait(1)
        self.play(question.animate.to_edge(UP))
        
        # Visual example with apples
        explanation = Text("Numbers help us count things!", font_size=32)
        explanation.next_to(question, DOWN, buff=0.5)
        self.play(FadeIn(explanation), run_time=1.5)
        self.wait(1)
        
        # Show counting apples
        apples = VGroup()
        for i in range(5):
            apple = Circle(radius=0.3, color=RED, fill_opacity=0.7)
            apple.shift(LEFT * 4 + RIGHT * i * 1.5 + DOWN * 1)
            apples.add(apple)
        
        # Teacher Voice: "Let's count apples. 1, 2, 3, 4, 5!"
        for i, apple in enumerate(apples):
            number = Text(str(i + 1), font_size=36, color=WHITE)
            number.next_to(apple, DOWN)
            self.play(FadeIn(apple), Write(number), run_time=0.8)
            self.wait(0.5)
        
        self.wait(2)
        self.play(FadeOut(apples), FadeOut(explanation))
        
        # PART 3: TYPES OF NUMBERS - NATURAL NUMBERS
        # Teacher Voice: "Now let's see different types of numbers. First are Natural Numbers."
        
        self.play(FadeOut(question))
        
        natural_title = Text("1. Natural Numbers (N)", font_size=36, color=BLUE)
        natural_title.to_edge(UP)
        self.play(Write(natural_title), run_time=2)
        self.wait(1)
        
        natural_def = Text("Numbers we use for counting", font_size=28)
        natural_def.next_to(natural_title, DOWN, buff=0.5)
        self.play(FadeIn(natural_def), run_time=1.5)
        self.wait(1)
        
        # Show natural numbers
        natural_numbers = Text("1, 2, 3, 4, 5, 6, 7, 8, 9, 10...", font_size=32, color=YELLOW)
        natural_numbers.next_to(natural_def, DOWN, buff=0.8)
        self.play(Write(natural_numbers), run_time=2)
        self.wait(2)
        
        # Visual representation with dots
        dots = VGroup()
        for i in range(1, 6):
            dot_group = VGroup()
            for j in range(i):
                dot = Dot(color=GREEN, radius=0.1)
                dot.shift(LEFT * 0.3 * (i - 1) / 2 + RIGHT * 0.3 * j)
                dot_group.add(dot)
            label = Text(str(i), font_size=24)
            label.next_to(dot_group, DOWN, buff=0.2)
            combined = VGroup(dot_group, label)
            combined.shift(LEFT * 5 + RIGHT * i * 2 + DOWN * 2)
            dots.add(combined)
        
        # Teacher Voice: "See? 1 dot, 2 dots, 3 dots... these are natural numbers!"
        self.play(FadeIn(dots), run_time=2)
        self.wait(2)
        
        self.play(FadeOut(dots), FadeOut(natural_numbers), FadeOut(natural_def), FadeOut(natural_title))
        
        # PART 4: WHOLE NUMBERS
        # Teacher Voice: "Next are Whole Numbers. They include zero too!"
        
        whole_title = Text("2. Whole Numbers (W)", font_size=36, color=PURPLE)
        whole_title.to_edge(UP)
        self.play(Write(whole_title), run_time=2)
        self.wait(1)
        
        whole_def = Text("Natural Numbers + Zero", font_size=28)
        whole_def.next_to(whole_title, DOWN, buff=0.5)
        self.play(FadeIn(whole_def), run_time=1.5)
        self.wait(1)
        
        whole_numbers = Text("0, 1, 2, 3, 4, 5, 6, 7, 8, 9...", font_size=32, color=YELLOW)
        whole_numbers.next_to(whole_def, DOWN, buff=0.8)
        self.play(Write(whole_numbers), run_time=2)
        self.wait(1)
        
        # Highlight zero
        zero_highlight = Text("Zero (0) means 'nothing'", font_size=28, color=RED)
        zero_highlight.next_to(whole_numbers, DOWN, buff=0.8)
        self.play(FadeIn(zero_highlight), run_time=1.5)
        
        # Visual: empty basket
        basket = Circle(radius=0.8, color=ORANGE)
        basket.shift(DOWN * 2)
        basket_label = Text("0 apples", font_size=24)
        basket_label.next_to(basket, DOWN)
        
        # Teacher Voice: "Zero means we have nothing. Like an empty basket!"
        self.play(Create(basket), Write(basket_label), run_time=2)
        self.wait(2)
        
        self.play(FadeOut(basket), FadeOut(basket_label), FadeOut(zero_highlight), 
                  FadeOut(whole_numbers), FadeOut(whole_def), FadeOut(whole_title))
        
        # PART 5: INTEGERS
        # Teacher Voice: "Now let's learn about Integers. These include negative numbers too!"
        
        integer_title = Text("3. Integers (Z)", font_size=36, color=ORANGE)
        integer_title.to_edge(UP)
        self.play(Write(integer_title), run_time=2)
        self.wait(1)
        
        integer_def = Text("Positive and Negative whole numbers", font_size=28)
        integer_def.next_to(integer_title, DOWN, buff=0.5)
        self.play(FadeIn(integer_def), run_time=1.5)
        self.wait(1)
        
        integer_numbers = Text("...-3, -2, -1, 0, 1, 2, 3...", font_size=32, color=YELLOW)
        integer_numbers.next_to(integer_def, DOWN, buff=0.8)
        self.play(Write(integer_numbers), run_time=2)
        self.wait(2)
        
        # Number line for integers
        # Teacher Voice: "Let's see this on a number line. Negative numbers go left, positive go right!"
        
        number_line = NumberLine(
            x_range=[-5, 5, 1],
            length=10,
            include_numbers=True,
            label_direction=DOWN,
            font_size=24
        )
        number_line.shift(DOWN * 1.5)
        
        self.play(Create(number_line), run_time=3)
        self.wait(1)
        
        # Highlight negative side
        negative_arrow = Arrow(start=UP * 0.5 + LEFT * 3, end=DOWN * 0.8 + LEFT * 3, color=RED)
        negative_label = Text("Negative", font_size=24, color=RED)
        negative_label.next_to(negative_arrow, UP)
        
        self.play(GrowArrow(negative_arrow), Write(negative_label), run_time=1.5)
        self.wait(1)
        
        # Highlight positive side
        positive_arrow = Arrow(start=UP * 0.5 + RIGHT * 3, end=DOWN * 0.8 + RIGHT * 3, color=GREEN)
        positive_label = Text("Positive", font_size=24, color=GREEN)
        positive_label.next_to(positive_arrow, UP)
        
        self.play(GrowArrow(positive_arrow), Write(positive_label), run_time=1.5)
        self.wait(2)
        
        self.play(FadeOut(number_line), FadeOut(negative_arrow), FadeOut(negative_label),
                  FadeOut(positive_arrow), FadeOut(positive_label),
                  FadeOut(integer_numbers), FadeOut(integer_def), FadeOut(integer_title))
        
        # PART 6: REAL-LIFE EXAMPLES
        # Teacher Voice: "Let's see where we use these numbers in real life!"
        
        real_life_title = Text("Real-Life Examples", font_size=40, color=GREEN)
        self.play(Write(real_life_title), run_time=2)
        self.wait(1)
        self.play(real_life_title.animate.to_edge(UP))
        
        examples = VGroup(
            Text("• Temperature: -5°C (negative), 30°C (positive)", font_size=26),
            Text("• Money: ₹100 (have), -₹50 (owe)", font_size=26),
            Text("• Floors: -2 (basement), 0 (ground), 5 (fifth floor)", font_size=26),
        )
        examples.arrange(DOWN, aligned_edge=LEFT, buff=0.5)
        examples.next_to(real_life_title, DOWN, buff=1)
        
        # Teacher Voice: "Temperature can be negative in winter, positive in summer!"
        for example in examples:
            self.play(FadeIn(example), run_time=2)
            self.wait(2)
        
        self.wait(2)
        self.play(FadeOut(examples), FadeOut(real_life_title))
        
        # PART 7: SUMMARY
        # Teacher Voice: "Great job! Let's quickly review what we learned today."
        
        summary_title = Text("Summary", font_size=44, color=BLUE)
        summary_title.to_edge(UP)
        self.play(Write(summary_title), run_time=2)
        self.wait(1)
        
        summary_points = VGroup(
            Text("✓ Natural Numbers: 1, 2, 3, 4...", font_size=28, color=BLUE),
            Text("✓ Whole Numbers: 0, 1, 2, 3...", font_size=28, color=PURPLE),
            Text("✓ Integers: ...-2, -1, 0, 1, 2...", font_size=28, color=ORANGE),
        )
        summary_points.arrange(DOWN, aligned_edge=LEFT, buff=0.6)
        summary_points.next_to(summary_title, DOWN, buff=1)
        
        for point in summary_points:
            self.play(FadeIn(point), run_time=1.5)
            self.wait(1)
        
        self.wait(2)
        
        # PART 8: ENCOURAGEMENT
        # Teacher Voice: "You did amazing! Keep practicing, and you'll master this!"
        
        self.play(FadeOut(summary_points), FadeOut(summary_title))
        
        encouragement = Text("You're doing great! 🌟", font_size=40, color=YELLOW)
        keep_learning = Text("Keep practicing!", font_size=32, color=GREEN)
        keep_learning.next_to(encouragement, DOWN, buff=0.5)
        
        self.play(Write(encouragement), run_time=2)
        self.play(FadeIn(keep_learning), run_time=1.5)
        self.wait(3)
        
        self.play(FadeOut(encouragement), FadeOut(keep_learning))
        self.wait(1)