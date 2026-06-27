package com.examplatform.question.service;

import com.examplatform.common.exception.BadRequestException;
import com.examplatform.common.exception.ResourceNotFoundException;
import com.examplatform.exam.entity.Exam;
import com.examplatform.exam.repository.ExamRepository;
import com.examplatform.question.dto.ChoiceDto;
import com.examplatform.question.dto.QuestionDto;
import com.examplatform.question.entity.Choice;
import com.examplatform.question.entity.Question;
import com.examplatform.question.entity.QuestionType;
import com.examplatform.question.mapper.QuestionMapper;
import com.examplatform.question.repository.QuestionRepository;
import com.examplatform.user.entity.Role;
import com.examplatform.user.entity.User;
import com.examplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final QuestionMapper questionMapper;

    @Transactional
    public QuestionDto addQuestion(Long examId, QuestionDto dto, String email) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        validateExamModification(exam, email);
        validateQuestionChoices(dto);

        Question question = Question.builder()
                .statement(dto.getStatement())
                .type(dto.getType())
                .points(dto.getPoints())
                .explanation(dto.getExplanation())
                .exam(exam)
                .build();

        if (dto.getType() != QuestionType.TEXT && dto.getChoices() != null) {
            for (ChoiceDto choiceDto : dto.getChoices()) {
                Choice choice = Choice.builder()
                        .label(choiceDto.getLabel())
                        .isCorrect(choiceDto.getIsCorrect() != null && choiceDto.getIsCorrect())
                        .question(question)
                        .build();
                question.getChoices().add(choice);
            }
        }

        Question savedQuestion = questionRepository.save(question);
        
        // Update Exam total marks
        updateExamTotalMarks(exam);

        return questionMapper.toDto(savedQuestion);
    }

    @Transactional
    public QuestionDto updateQuestion(Long questionId, QuestionDto dto, String email) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        Exam exam = question.getExam();
        validateExamModification(exam, email);
        validateQuestionChoices(dto);

        question.setStatement(dto.getStatement());
        question.setType(dto.getType());
        question.setPoints(dto.getPoints());
        question.setExplanation(dto.getExplanation());

        // Refresh choices
        question.getChoices().clear();
        if (dto.getType() != QuestionType.TEXT && dto.getChoices() != null) {
            for (ChoiceDto choiceDto : dto.getChoices()) {
                Choice choice = Choice.builder()
                        .label(choiceDto.getLabel())
                        .isCorrect(choiceDto.getIsCorrect() != null && choiceDto.getIsCorrect())
                        .question(question)
                        .build();
                question.getChoices().add(choice);
            }
        }

        Question savedQuestion = questionRepository.save(question);
        updateExamTotalMarks(exam);

        return questionMapper.toDto(savedQuestion);
    }

    @Transactional
    public void deleteQuestion(Long questionId, String email) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        Exam exam = question.getExam();
        validateExamModification(exam, email);

        questionRepository.delete(question);
        updateExamTotalMarks(exam);
    }

    public List<QuestionDto> getQuestionsForExam(Long examId, String email) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_STUDENT) {
            if (!exam.isPublished()) {
                throw new AccessDeniedException("You do not have permission to view questions for this exam");
            }
            // Return stripped choices to avoid leak
            return questionRepository.findByExamIdWithChoices(examId).stream()
                    .map(questionMapper::toDtoForStudent)
                    .collect(Collectors.toList());
        }

        // For Teacher/Admin, return full data
        validateExamAccess(exam, email);
        return questionRepository.findByExamIdWithChoices(examId).stream()
                .map(questionMapper::toDto)
                .collect(Collectors.toList());
    }

    // Helpers

    private void validateExamAccess(Exam exam, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ROLE_ADMIN && !exam.getCreatedBy().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to access questions for this exam");
        }
    }

    private void validateExamModification(Exam exam, String email) {
        validateExamAccess(exam, email);

        if (exam.isPublished()) {
            throw new BadRequestException("Cannot modify questions on a published exam. Please unpublish it first.");
        }
    }

    private void updateExamTotalMarks(Exam exam) {
        List<Question> questions = questionRepository.findByExamId(exam.getId());
        int total = questions.stream().mapToInt(Question::getPoints).sum();
        exam.setTotalMarks(total);
        examRepository.save(exam);
    }

    private void validateQuestionChoices(QuestionDto dto) {
        if (dto.getType() == QuestionType.TEXT) {
            if (dto.getChoices() != null && !dto.getChoices().isEmpty()) {
                throw new BadRequestException("Text questions cannot have choices");
            }
            return;
        }

        if (dto.getChoices() == null || dto.getChoices().isEmpty()) {
            throw new BadRequestException("Choices are required for " + dto.getType() + " questions");
        }

        long correctCount = dto.getChoices().stream()
                .filter(c -> c.getIsCorrect() != null && c.getIsCorrect())
                .count();

        if (dto.getType() == QuestionType.TRUE_FALSE) {
            if (dto.getChoices().size() != 2) {
                throw new BadRequestException("True/False questions must have exactly 2 choices");
            }
            if (correctCount != 1) {
                throw new BadRequestException("True/False questions must have exactly 1 correct choice");
            }
        } else if (dto.getType() == QuestionType.SINGLE_CHOICE) {
            if (correctCount != 1) {
                throw new BadRequestException("Single choice questions must have exactly 1 correct choice");
            }
        } else if (dto.getType() == QuestionType.MULTIPLE_CHOICE) {
            if (correctCount < 1) {
                throw new BadRequestException("Multiple choice questions must have at least 1 correct choice");
            }
        }
    }
}
