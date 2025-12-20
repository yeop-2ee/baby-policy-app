import { NextResponse } from 'next/server';
import { getGeminiApiKey } from '@/lib/env';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 사용자 프로필 정보 가져오기
    let userProfile = null;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            include: {
              children: true,
            },
          },
        },
      });
      userProfile = user?.profile || null;
    }

    // 사용 가능한 정책 목록 가져오기
    const policies = await prisma.policy.findMany({
      take: 50, // 최대 50개 정책만 가져오기
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        benefitAmount: true,
        targetCity: true,
        targetDistrict: true,
        minChildAge: true,
        maxChildAge: true,
        minIncomeLevel: true,
        maxIncomeLevel: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 프로필 정보를 텍스트로 변환
    const profileText = userProfile
      ? `사용자 프로필:
- 거주지: ${userProfile.city} ${userProfile.district || ''} ${userProfile.neighborhood || ''}
- 소득 수준: ${userProfile.incomeLevel || '미설정'}
- 자녀 수: ${userProfile.childCount}명
- 맞벌이: ${userProfile.dualIncome ? '예' : '아니오'}
- 다자녀: ${userProfile.multiChild ? '예' : '아니오'}
${userProfile.children.length > 0 ? `- 자녀 정보:\n${userProfile.children.map((c: any, i: number) => `  ${i + 1}. ${c.name || '이름 없음'}, 나이: ${c.age}세`).join('\n')}` : ''}`
      : '사용자 프로필이 설정되지 않았습니다.';

    // 정책 목록을 텍스트로 변환
    const policiesText = policies
      .map(
        (p, i) =>
          `${i + 1}. ${p.title}
   - 카테고리: ${p.category}
   - 설명: ${p.description || '설명 없음'}
   - 혜택: ${p.benefitAmount ? `${p.benefitAmount.toLocaleString()}원` : '정보 없음'}
   - 대상 지역: ${p.targetCity || '전국'} ${p.targetDistrict || ''}
   - 자녀 나이: ${p.minChildAge !== null && p.maxChildAge !== null ? `${p.minChildAge}세~${p.maxChildAge}세` : '제한 없음'}
   - 소득 수준: ${p.minIncomeLevel || ''} ~ ${p.maxIncomeLevel || ''}
   - 정책 ID: ${p.id}`
      )
      .join('\n\n');

    // Gemini API 호출
    const apiKey = getGeminiApiKey();
    const prompt = `당신은 육아 정책 추천 전문가입니다. 사용자의 상황을 분석하고 적합한 정책을 추천해주세요.

${profileText}

사용자 메시지: ${message}

사용 가능한 정책 목록:
${policiesText}

지침:
1. 사용자의 상황과 메시지를 분석하세요.
2. 사용자 프로필과 사용 가능한 정책 목록을 참고하여 가장 적합한 정책 3-5개를 추천하세요.
3. 각 정책을 추천할 때는 정책 ID를 반드시 포함하세요.
4. 친근하고 도움이 되는 톤으로 답변하세요.
5. 정책 추천 시 구체적인 이유를 설명하세요.
6. 한국어로 답변하세요.
7. 정책 ID는 [정책ID:정책id값] 형식으로 표시하세요.

답변 형식:
- 추천 정책을 번호와 함께 나열
- 각 정책의 제목, 주요 혜택, 추천 이유 설명
- 정책 ID를 [정책ID:xxx] 형식으로 포함`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        error: '챗봇 응답 생성 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

