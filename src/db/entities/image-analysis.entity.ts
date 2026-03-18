import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'image_analysis' })
export class ImageAnalysis {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({
		name: 'image_url',
		length: 512,
	})
	imageUrl!: string;

	@Column({
		name: 'original_name',
		length: 256,
	})
	originalName!: string;

	@Column({
		type: 'text',
		name: 'mime_type',
	})
	mimeType!: string;

	@Column({
		type: 'text',
		name: 'ai_response',
	})
	aiResponse!: string;

	@Column({
		name: 'prompt_used',
		type: 'text',
		nullable: true,
	})
	promptUsed?: string;

	@CreateDateColumn({
		name: 'created_at',
	})
	createdAt!: Date;
}
