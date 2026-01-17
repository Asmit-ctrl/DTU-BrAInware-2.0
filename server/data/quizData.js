// Mathematics Quizzes for Class 9th - Number System & Polynomials
const class9Quizzes = [
  // Quiz 1: Polynomials (Class 9)
  {
    quizId: 'QUIZ-MATH-POLY-001',
    title: 'Polynomials (Class 9)',
    description: 'Test your understanding of polynomials, degree, zeros, and factorization - Part A: MCQs, Part B: Short Answer, Part C: Concept Questions',
    subject: 'Mathematics',
    grade: '9th',
    timeLimit: 30,
    totalQuestions: 15,
    questions: [
      // Part A: MCQs (1 mark each)
      {
        questionId: 'Q1-POLY',
        questionText: 'Part A - Q1 (1 mark): Which of the following is a polynomial?',
        options: ['1/x + 2', 'x² + 3x + 5', '√x + 1', 'x⁻² + 4'],
        correctAnswer: 1,
        hint: 'A polynomial cannot have negative or fractional powers of x',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q2-POLY',
        questionText: 'Part A - Q2 (1 mark): Degree of polynomial 7x⁵ + 3x² + 1 is:',
        options: ['2', '5', '7', '1'],
        correctAnswer: 1,
        hint: 'Degree is the highest power of the variable',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q3-POLY',
        questionText: 'Part A - Q3 (1 mark): A polynomial of degree 1 is called:',
        options: ['Linear polynomial', 'Quadratic polynomial', 'Cubic polynomial', 'Constant polynomial'],
        correctAnswer: 0,
        hint: 'Linear means degree 1, Quadratic means degree 2',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q4-POLY',
        questionText: 'Part A - Q4 (1 mark): Which is a quadratic polynomial?',
        options: ['2x + 3', 'x² + x + 1', 'x³ + 2', '9'],
        correctAnswer: 1,
        hint: 'Quadratic means degree 2 (highest power is 2)',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q5-POLY',
        questionText: 'Part A - Q5 (1 mark): The constant term in 4x³ - 2x + 7 is:',
        options: ['4', '-2', '7', '0'],
        correctAnswer: 2,
        hint: 'Constant term has no variable (x⁰)',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q6-POLY',
        questionText: 'Part A - Q6 (1 mark): The coefficient of x² in 5x² - 3x + 1 is:',
        options: ['5', '-3', '1', '2'],
        correctAnswer: 0,
        hint: 'Coefficient is the number multiplied with x²',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q7-POLY',
        questionText: 'Part A - Q7 (1 mark): Value of p(x) = x² + 2x + 1 at x = 2 is:',
        options: ['5', '7', '9', '11'],
        correctAnswer: 2,
        hint: 'Substitute x = 2: (2)² + 2(2) + 1 = 4 + 4 + 1',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q8-POLY',
        questionText: 'Part A - Q8 (1 mark): If x = 3 is a zero of polynomial p(x) = x - 3, then p(3) =',
        options: ['3', '0', '-3', '1'],
        correctAnswer: 1,
        hint: 'A zero of a polynomial makes p(x) = 0',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      
      // Part B: Short Answer (2 marks each)
      {
        questionId: 'Q9-POLY',
        questionText: 'Part B - Q9 (2 marks): Find the degree of polynomial: 3x⁴ - 5x² + x - 9',
        options: ['1', '2', '4', '9'],
        correctAnswer: 2,
        hint: 'Look for the highest power of x in the polynomial',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q10-POLY',
        questionText: 'Part B - Q10 (2 marks): Find the value of p(x) = 2x³ - x + 4 at x = 1',
        options: ['3', '4', '5', '6'],
        correctAnswer: 2,
        hint: 'Substitute x = 1: 2(1)³ - 1 + 4 = 2 - 1 + 4',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q11-POLY',
        questionText: 'Part B - Q11 (2 marks): Find the zero of polynomial p(x) = x + 6',
        options: ['6', '-6', '0', '1'],
        correctAnswer: 1,
        hint: 'Set p(x) = 0 and solve: x + 6 = 0, so x = -6',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q12-POLY',
        questionText: 'Part B - Q12 (2 marks): Which of the following is a polynomial of degree 3 with 4 terms?',
        options: ['x³ + 2x', 'x³ + x² + x + 1', 'x² + x + 1', 'x + 1'],
        correctAnswer: 1,
        hint: 'Degree 3 means highest power is 3, and it should have 4 separate terms',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      
      // Part C: Long/Concept Questions (3 marks each)
      {
        questionId: 'Q13-POLY',
        questionText: 'Part C - Q13 (3 marks): Factorize x² - 9. What are the factors?',
        options: ['(x - 3)(x - 3)', '(x + 3)(x + 3)', '(x + 3)(x - 3)', '(x + 9)(x - 1)'],
        correctAnswer: 2,
        hint: 'Use the identity a² - b² = (a + b)(a - b). Here x² - 9 = x² - 3²',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q14-POLY',
        questionText: 'Part C - Q14 (3 marks): Find the zeros of polynomial x² - 5x + 6. The zeros are:',
        options: ['2 and 3', '1 and 6', '-2 and -3', '5 and 6'],
        correctAnswer: 0,
        hint: 'Factorize: x² - 5x + 6 = (x - 2)(x - 3). Set each factor to 0',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q15-POLY',
        questionText: 'Part C - Q15 (3 marks): If p(x) = x² - 4x + 3, is x = 1 a zero of the polynomial?',
        options: ['Yes, because p(1) = 0', 'No, because p(1) = 2', 'No, because p(1) = -2', 'Yes, because p(1) = 1'],
        correctAnswer: 0,
        hint: 'Calculate p(1) = (1)² - 4(1) + 3 = 1 - 4 + 3 = 0. If result is 0, then x = 1 is a zero',
        subject: 'Mathematics',
        difficulty: 'hard'
      }
    ]
  },

  // Quiz 2: Number System (Class 9)
  {
    quizId: 'QUIZ-MATH-NUM-001',
    title: 'Number System (Class 9)',
    description: 'Test your knowledge of rational numbers, irrational numbers, real numbers, and their properties',
    subject: 'Mathematics',
    grade: '9th',
    timeLimit: 30,
    totalQuestions: 15,
    questions: [
      // Part A: MCQs (1 mark each)
      {
        questionId: 'Q1-NUM',
        questionText: 'Part A - Q1 (1 mark): Which of the following is a rational number?',
        options: ['√2', '√3', '3/4', 'π'],
        correctAnswer: 2,
        hint: 'Rational numbers can be expressed as p/q where p and q are integers',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q2-NUM',
        questionText: 'Part A - Q2 (1 mark): Which is an irrational number?',
        options: ['0.5', '√4', '√5', '7/3'],
        correctAnswer: 2,
        hint: 'Irrational numbers cannot be expressed as fractions. √5 is not a perfect square',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q3-NUM',
        questionText: 'Part A - Q3 (1 mark): 0.333... (repeating) is a:',
        options: ['Natural number', 'Irrational number', 'Rational number', 'Whole number'],
        correctAnswer: 2,
        hint: '0.333... = 1/3, which is a fraction',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q4-NUM',
        questionText: 'Part A - Q4 (1 mark): √16 is:',
        options: ['Irrational', 'Rational', 'Neither', 'Complex'],
        correctAnswer: 1,
        hint: '√16 = 4, which can be written as 4/1',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q5-NUM',
        questionText: 'Part A - Q5 (1 mark): π (pi) is:',
        options: ['Rational number', 'Irrational number', 'Integer', 'Whole number'],
        correctAnswer: 1,
        hint: 'π = 3.14159... is a non-repeating, non-terminating decimal',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q6-NUM',
        questionText: 'Part A - Q6 (1 mark): Between which two integers does √50 lie?',
        options: ['5 and 6', '6 and 7', '7 and 8', '8 and 9'],
        correctAnswer: 2,
        hint: 'Calculate: 7² = 49 and 8² = 64, so √50 is between 7 and 8',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q7-NUM',
        questionText: 'Part A - Q7 (1 mark): 0.25 in fraction form is:',
        options: ['1/2', '1/4', '1/8', '2/5'],
        correctAnswer: 1,
        hint: '0.25 = 25/100 = 1/4',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q8-NUM',
        questionText: 'Part A - Q8 (1 mark): Which is the smallest natural number?',
        options: ['0', '1', '-1', '2'],
        correctAnswer: 1,
        hint: 'Natural numbers start from 1: {1, 2, 3, 4, ...}',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      
      // Part B: Short Answer (2 marks each)
      {
        questionId: 'Q9-NUM',
        questionText: 'Part B - Q9 (2 marks): Simplify: √(64/25)',
        options: ['8/5', '64/25', '32/5', '16/5'],
        correctAnswer: 0,
        hint: '√(64/25) = √64/√25 = 8/5',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q10-NUM',
        questionText: 'Part B - Q10 (2 marks): Rationalize: 1/√3',
        options: ['√3', '√3/3', '3/√3', '1/3'],
        correctAnswer: 1,
        hint: 'Multiply numerator and denominator by √3',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q11-NUM',
        questionText: 'Part B - Q11 (2 marks): Convert 0.6 (repeating) to fraction:',
        options: ['6/10', '2/3', '3/5', '1/6'],
        correctAnswer: 1,
        hint: 'Let x = 0.666..., then 10x = 6.666..., so 10x - x = 6',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q12-NUM',
        questionText: 'Part B - Q12 (2 marks): What is 3√2 + 2√2?',
        options: ['5√2', '5√4', '6√2', '√10'],
        correctAnswer: 0,
        hint: 'Add the coefficients: 3√2 + 2√2 = (3 + 2)√2',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      
      // Part C: Long/Concept Questions (3 marks each)
      {
        questionId: 'Q13-NUM',
        questionText: 'Part C - Q13 (3 marks): Express √12 in simplest form:',
        options: ['2√3', '3√2', '√6', '4√3'],
        correctAnswer: 0,
        hint: '√12 = √(4 × 3) = √4 × √3 = 2√3',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q14-NUM',
        questionText: 'Part C - Q14 (3 marks): If √3 = 1.732, find the value of 1/√3 (approx):',
        options: ['0.577', '0.866', '1.155', '0.433'],
        correctAnswer: 0,
        hint: 'Rationalize: 1/√3 = √3/3 = 1.732/3 ≈ 0.577',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q15-NUM',
        questionText: 'Part C - Q15 (3 marks): Which of these statements is TRUE?',
        options: ['Sum of two irrational numbers is always irrational', 'Product of two irrational numbers is always irrational', 'Sum of rational and irrational is always irrational', 'All of the above'],
        correctAnswer: 2,
        hint: 'Test examples: √2 + (-√2) = 0 (rational), but 2 + √3 is always irrational',
        subject: 'Mathematics',
        difficulty: 'hard'
      }
    ]
  },

  // Quiz 3: Algebraic Expressions (Class 9)
  {
    quizId: 'QUIZ-MATH-ALG-001',
    title: 'Algebraic Expressions (Class 9)',
    description: 'Test your skills in expanding, factorizing, and simplifying algebraic expressions',
    subject: 'Mathematics',
    grade: '9th',
    timeLimit: 25,
    totalQuestions: 12,
    questions: [
      {
        questionId: 'Q1-ALG',
        questionText: 'Q1 (1 mark): Expand (x + 3)(x + 2)',
        options: ['x² + 5x + 6', 'x² + 6x + 5', 'x² + x + 6', 'x² + 5x + 5'],
        correctAnswer: 0,
        hint: 'Use FOIL method: First, Outer, Inner, Last',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q2-ALG',
        questionText: 'Q2 (1 mark): Simplify: (x + y)² =',
        options: ['x² + y²', 'x² + 2xy + y²', 'x² - 2xy + y²', '2x² + 2y²'],
        correctAnswer: 1,
        hint: 'Use the identity (a + b)² = a² + 2ab + b²',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q3-ALG',
        questionText: 'Q3 (1 mark): (x - y)² =',
        options: ['x² - y²', 'x² + y²', 'x² - 2xy + y²', 'x² + 2xy - y²'],
        correctAnswer: 2,
        hint: 'Use the identity (a - b)² = a² - 2ab + b²',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q4-ALG',
        questionText: 'Q4 (1 mark): x² - y² =',
        options: ['(x - y)²', '(x + y)²', '(x + y)(x - y)', '(x - y)(x + y)'],
        correctAnswer: 2,
        hint: 'Difference of squares: a² - b² = (a + b)(a - b)',
        subject: 'Mathematics',
        difficulty: 'easy'
      },
      {
        questionId: 'Q5-ALG',
        questionText: 'Q5 (2 marks): Factor: x² + 7x + 12',
        options: ['(x + 3)(x + 4)', '(x + 2)(x + 6)', '(x + 1)(x + 12)', '(x - 3)(x - 4)'],
        correctAnswer: 0,
        hint: 'Find two numbers that multiply to 12 and add to 7',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q6-ALG',
        questionText: 'Q6 (2 marks): Simplify: (x + 5)² - (x - 5)²',
        options: ['10x', '20x', '10', '20'],
        correctAnswer: 1,
        hint: 'Use (a + b)² - (a - b)² = 4ab',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q7-ALG',
        questionText: 'Q7 (2 marks): Factor: 2x² + 5x + 3',
        options: ['(2x + 1)(x + 3)', '(2x + 3)(x + 1)', '(x + 1)(2x + 3)', '(2x - 1)(x - 3)'],
        correctAnswer: 1,
        hint: 'Find factors such that 2×3 = 6 and they add to give 5x',
        subject: 'Mathematics',
        difficulty: 'medium'
      },
      {
        questionId: 'Q8-ALG',
        questionText: 'Q8 (2 marks): If x + 1/x = 5, find x² + 1/x²',
        options: ['23', '25', '27', '21'],
        correctAnswer: 0,
        hint: 'Square both sides: (x + 1/x)² = x² + 2 + 1/x²',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q9-ALG',
        questionText: 'Q9 (3 marks): Simplify: (x + 2)³',
        options: ['x³ + 8', 'x³ + 6x² + 12x + 8', 'x³ + 2x² + 4x + 8', 'x³ + 8x'],
        correctAnswer: 1,
        hint: 'Use (a + b)³ = a³ + 3a²b + 3ab² + b³',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q10-ALG',
        questionText: 'Q10 (3 marks): Factor completely: x³ - 8',
        options: ['(x - 2)(x² + 2x + 4)', '(x - 2)(x² - 2x + 4)', '(x - 2)³', '(x + 2)(x² - 4)'],
        correctAnswer: 0,
        hint: 'Use a³ - b³ = (a - b)(a² + ab + b²)',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q11-ALG',
        questionText: 'Q11 (3 marks): If a + b = 10 and ab = 24, find a² + b²',
        options: ['52', '48', '44', '56'],
        correctAnswer: 0,
        hint: 'Use (a + b)² = a² + 2ab + b², so a² + b² = (a + b)² - 2ab',
        subject: 'Mathematics',
        difficulty: 'hard'
      },
      {
        questionId: 'Q12-ALG',
        questionText: 'Q12 (3 marks): Simplify: (x + y + z)² - (x² + y² + z²)',
        options: ['2(xy + yz + zx)', 'xy + yz + zx', '2xyz', '0'],
        correctAnswer: 0,
        hint: '(x + y + z)² = x² + y² + z² + 2(xy + yz + zx)',
        subject: 'Mathematics',
        difficulty: 'hard'
      }
    ]
  }
];

module.exports = class9Quizzes;
