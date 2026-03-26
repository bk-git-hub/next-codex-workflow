# next-codex-workflow 테스트 문서

## 개요

이 문서는 `next-codex-workflow` 저장소의 현재 테스트 코드가 무엇을 검증하는지,
그리고 그 테스트들이 제품 수준에서 실제로 어떤 보장을 주는지를 한국어로
정리한 문서다.

현재 기준 테스트 현황:

- 테스트 파일 수: `5`
- 테스트 케이스 수: `34`
- 테스트 러너: `Vitest`
- 실행 명령어: `npm run test`

## 실행 방법

```bash
npm run test
```

타입 검사까지 함께 확인하려면:

```bash
npm run check
```

## 테스트 파일 구성

현재 테스트 파일은 다음과 같다.

- [tests/detection.test.ts](/c:/Users/bksoft/Desktop/next-codex-workflow/tests/detection.test.ts)
- [tests/init-command.test.ts](/c:/Users/bksoft/Desktop/next-codex-workflow/tests/init-command.test.ts)
- [tests/generation.test.ts](/c:/Users/bksoft/Desktop/next-codex-workflow/tests/generation.test.ts)
- [tests/main.test.ts](/c:/Users/bksoft/Desktop/next-codex-workflow/tests/main.test.ts)
- [tests/update-command.test.ts](/c:/Users/bksoft/Desktop/next-codex-workflow/tests/update-command.test.ts)

## 파일별 테스트 상세

### 1. `detection.test.ts`

대상:

- 저장소 감지 로직
- Next.js 지원 여부 판별
- 라우터/패키지 매니저/성능 모드 후보 탐지

테스트 케이스:

1. `detects a supported App Router repository`
   - App Router 기반 Next.js 저장소를 정상 지원 대상으로 인식하는지 검증
   - `next` 버전, package manager, TypeScript 여부, 성능 모드 eligibility, route discovery까지 확인
2. `fails clearly when package.json is missing`
   - `package.json`이 없는 경우 명확한 unsupported 에러를 반환하는지 검증
3. `fails clearly when next is not declared`
   - `next` 의존성이 없으면 Next.js 저장소가 아니라고 판별하는지 검증
4. `requires disambiguation for multiple lockfiles unless --yes is supplied`
   - lockfile이 여러 개일 때 기본 모드에서는 실패하고, `--yes`일 때 우선순위에 따라 자동 선택하는지 검증

이 파일이 보장하는 것:

- 지원 저장소 판별 기준이 깨지지 않는다.
- 잘못된 저장소에서 `init`이 애매하게 진행되지 않는다.
- lockfile 중복 상황에서 사용자 안전장치가 동작한다.

### 2. `init-command.test.ts`

대상:

- `init` CLI 인자 파싱
- `runInitCommand` 실행 흐름
- 인터랙티브 설치기와 `--yes`
- multi-agent 전제조건 안내

테스트 케이스:

#### `parseInitArgs`

1. `parses the supported init flags`
   - 지원 플래그 조합을 올바르게 파싱하는지 검증
2. `rejects an invalid external skill set`
   - 잘못된 `--external-skill-set` 값 거부
3. `rejects an invalid workflow mode`
   - 잘못된 `--workflow-mode` 값 거부
4. `rejects missing values for flags that require them`
   - 값이 필요한 플래그에서 값이 빠졌을 때 에러 처리

#### `runInitCommand`

5. `returns a dry-run summary for a supported repository`
   - 지원 저장소에서 dry-run이 정상 동작하고 요약/경고가 올바른지 검증
6. `notes when Codex multi-agent is already enabled`
   - Codex 설정에 multi-agent가 이미 켜져 있으면 경고 대신 note를 남기는지 검증
7. `does not require Codex multi-agent when the workflow mode is single-agent`
   - single-agent 모드에서는 multi-agent 전제조건을 강제하지 않는지 검증
8. `uses the interactive installer selections when a prompter is provided`
   - 인터랙티브 설치기의 선택값이 실제 옵션에 반영되는지 검증
9. `skips the interactive installer when --yes is used`
   - `--yes`일 때 인터랙티브 설치기를 건너뛰고 기본값을 사용하는지 검증
10. `returns an unsupported repository error with exit code 2`
   - 지원되지 않는 저장소에서 명확한 종료 코드와 에러를 반환하는지 검증

이 파일이 보장하는 것:

- `init` 명령어의 입력 처리 규칙이 안정적이다.
- `--yes`와 인터랙티브 설치기의 역할이 뒤섞이지 않는다.
- `single-agent`와 `multi-agent`의 전제조건 안내가 다르게 동작한다.
- unsupported 저장소를 조용히 통과시키지 않는다.

### 3. `generation.test.ts`

대상:

- 실제 파일 생성 결과
- 생성 파일의 내용
- managed file 보호 로직
- 성능 모드
- 외부 skill preset
- single-agent / multi-agent 생성 차이
- Windows typecheck fallback

테스트 케이스:

1. `writes the core managed files for a supported repository`
   - 핵심 파일들이 실제로 생성되는지 검증
   - 대상:
     - `AGENTS.md`
     - `.codex/config.toml`
     - `explorer/planner/executor/tester/verifier/reviewer` agent
     - `verify-agent-workflow.mjs`
     - workflow artifacts
     - `managed-files.json`
     - `install-state.json`
     - `skills-lock.json`
     - 내부/외부 skill 파일
   - 생성된 내용이 기대한 규칙을 포함하는지도 함께 확인
2. `does not write files during dry run`
   - dry-run에서 파일이 실제로 생성되지 않는지 검증
3. `fails with exit code 3 when an unmanaged target file already exists`
   - 사용자 소유 파일 충돌 시 덮어쓰지 않고 중단하는지 검증
4. `still blocks unmanaged files when overwriteManaged is enabled`
   - `--overwrite-managed`가 있어도 unmanaged 파일은 보호되는지 검증
5. `is idempotent when init runs twice with the same options`
   - 같은 옵션으로 두 번 실행해도 결과가 안정적인지 검증
6. `requires overwriteManaged to replace a changed managed file`
   - 이미 생성된 managed 파일이 수정된 경우 `--overwrite-managed`가 있어야 덮어쓰는지 검증
7. `adds performance files only when performance mode is enabled`
   - 성능 모드일 때만 Lighthouse 관련 파일과 skill이 생성되는지 검증
8. `runs the local TypeScript fallback without shell quoting issues on Windows`
   - Windows에서 TypeScript fallback 실행 시 경로 quoting 문제가 재발하지 않는지 검증
9. `selects external skills by preset and eligibility`
   - `minimal` / `full` preset과 optional skill eligibility가 올바르게 반영되는지 검증
10. `generates single-agent shortcut behavior when requested`
   - single-agent 모드일 때 shortcut skill 문구와 install-state가 올바르게 달라지는지 검증

이 파일이 보장하는 것:

- 실제 설치 결과물이 원하는 구조로 생성된다.
- managed/unmanaged 파일 안전장치가 동작한다.
- 성능 모드와 외부 skill preset이 의도대로 분기된다.
- single-agent와 multi-agent의 생성 규칙이 분리되어 있다.
- Windows 환경에서 검증 스크립트 fallback 관련 회귀가 방지된다.

### 4. `main.test.ts`

대상:

- 최상위 CLI 진입점

테스트 케이스:

1. `prints help when no command is provided`
   - 명령어 없이 실행했을 때 help가 정상 출력되는지 검증
2. `prints the current package version`
   - `--version`이 `package.json` 버전과 일치하는지 검증
3. `dispatches the init command`
   - CLI가 실제로 `init` 명령으로 정상 라우팅되는지 검증

이 파일이 보장하는 것:

- 기본 CLI UX가 깨지지 않는다.
- 버전 출력이 배포 버전과 어긋나지 않는다.
- 최상위 명령 디스패치가 작동한다.

### 5. `update-command.test.ts`

대상:

- `update` CLI 인자 파싱
- install-state 기반 갱신
- 구버전 설치 추론 복구
- interactive installer 재진입 방지

테스트 케이스:

#### `parseUpdateArgs`

1. `parses the supported update flags`
   - `update` 플래그를 정상 파싱하는지 검증
2. `rejects unsupported update flags`
   - 지원하지 않는 `update` 플래그를 거부하는지 검증

#### `runUpdateCommand`

3. `refreshes changed managed files using the saved install-state manifest`
   - `install-state.json`을 사용해 변경된 managed 파일을 복구/갱신하는지 검증
4. `infers legacy install settings when the install-state manifest is missing`
   - 구버전 설치처럼 manifest가 없어도 기존 생성 파일들로 설정을 추론하는지 검증
5. `infers the workflow mode from AGENTS.md when the plan shortcut file is unavailable`
   - legacy 복구 시 `plan-feature/SKILL.md`가 없어도 `AGENTS.md`로 workflow mode를 추론하는지 검증
6. `does not reopen the interactive installer during update`
   - `update`가 인터랙티브 설치기를 다시 열지 않는지 검증
7. `fails when no existing workflow installation is present`
   - 설치 이력이 없는 저장소에서 `update`가 명확하게 실패하는지 검증

이 파일이 보장하는 것:

- `update`가 `init`처럼 다시 설정 마법사로 변질되지 않는다.
- 구버전 설치도 일정 수준 자동 복구가 가능하다.
- 설치되지 않은 저장소에서 `update`를 잘못 성공시키지 않는다.

## 현재 테스트가 실제로 보장하는 것

이 테스트 스위트는 현재 제품에 대해 다음을 꽤 강하게 보장한다.

### 1. 설치/업데이트 로직의 안정성

- 지원 저장소 판별
- CLI 인자 파싱
- dry-run
- interactive / non-interactive 분기
- update 복구
- install-state 기반 refresh

즉, 사용자가 패키지를 설치하거나 업데이트할 때 깨질 수 있는 핵심 제어 흐름을 잘 덮고 있다.

### 2. 생성 결과물의 구조적 일관성

- 핵심 파일이 생성되는지
- agent/skill/artifact/manifest 구조가 맞는지
- single-agent / multi-agent 분기가 반영되는지
- performance mode / external skill preset이 반영되는지

즉, "무엇이 생성되어야 하는가"에 대한 구조 보장은 강하다.

### 3. 파일 안전장치

- unmanaged 파일은 덮어쓰지 않음
- managed 파일은 `--overwrite-managed` 없이는 덮어쓰지 않음
- 같은 옵션으로 재실행 시 idempotent

즉, 사용자의 기존 파일을 실수로 손상시킬 위험에 대한 기본 방어가 있다.

### 4. 특정 회귀 버그 방지

- Windows TypeScript fallback quoting 이슈
- update 시 interactive installer 재실행 이슈
- legacy workflow mode 추론 취약성

즉, 한 번 실제로 발견된 버그를 테스트로 고정해두는 회귀 방지 체계가 있다.

## 현재 테스트가 보장하지 않는 것

이 문서는 과장 없이 작성해야 하므로, 아래 항목은 아직 테스트만으로 보장된다고 말하면 안 된다.

### 1. 실제 Codex 런타임에서의 서브에이전트 동작 보장

현재 테스트는 생성된 파일과 문구를 검증하지만,
실제 Codex 세션에서 항상 원하는 대로 `spawn_agent`가 발생하는지까지는 자동 테스트하지 않는다.

즉:

- 서브에이전트 설정은 생성됨
- 강한 spawn 지시문도 생성됨
- 하지만 "실제 런타임에서 항상 그렇게 실행된다"는 것은 세션 로그 기반 스모크 테스트 영역이다

### 2. 실제 앱 코드 품질 보장

이 저장소의 테스트는 워크플로우 도구 자체를 테스트한다.

따라서 다음은 별도 앱 저장소에서 검증해야 한다.

- 생성된 workflow를 사용한 앱 코드의 품질
- UX 품질
- 실제 라우트 동작
- 실제 API 연동 결과

### 3. npm publish / 패키지 설치의 완전한 end-to-end 보장

현재 테스트는 CLI 동작과 파일 생성은 잘 보장하지만,
실제 `pnpm dlx` / `npm install` / 게시 이후 설치 흐름 전체를 자동화된 테스트로 완전히 덮고 있지는 않다.

### 4. 성능 수치 자체의 보장

performance mode 파일 생성은 테스트하지만,
실제 Lighthouse 결과나 앱 성능 개선 수치 자체를 자동 보장하지는 않는다.

## 포트폴리오나 설명에 쓸 때 안전한 표현

다음 표현은 비교적 안전하다.

- 워크플로우 설치, 업데이트, 파일 생성, 모드 분기, 안전한 overwrite 제어 로직에 대해 자동 테스트를 갖추고 있다
- 핵심 생성 결과물과 legacy update 복구 흐름에 대한 회귀 테스트가 있다
- single-agent / multi-agent / performance mode / external skill preset 분기를 자동 검증하고 있다

다음 표현은 조심해야 한다.

- 모든 Codex 런타임에서 서브에이전트 실행을 자동 보장한다
- 생성된 앱 코드 품질을 이 저장소 테스트만으로 보장한다
- 실제 배포 환경 설치 흐름 전체를 완전히 자동 보장한다

## 요약

현재 테스트 스위트는 "워크플로우 도구로서의 안정성"을 꽤 잘 보장한다.

특히 강한 부분:

- 설치/업데이트 흐름
- 생성 파일 구조
- 모드 분기
- 파일 보호
- 회귀 버그 방지

아직 별도 검증이 필요한 부분:

- 실제 Codex 세션에서의 행동 일관성
- workflow를 사용해 생성된 앱 코드의 품질
- 실제 브라우저/배포 레벨 end-to-end 검증

즉, 이 테스트 스위트는 제품의 "구성기 / 설치기 / 워크플로우 생성기"로서의 신뢰성을 높여주지만,
"실사용 런타임 결과 전체"를 완전히 대체하지는 않는다.

